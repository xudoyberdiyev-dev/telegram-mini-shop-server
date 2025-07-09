const Order = require('../models/Order');
const Basket = require('../models/Basket');
const Product = require('../models/Product');
const User = require('../models/User');
const {adminBot} = require('../bot/bot');
const OrderHistory = require('../models/History');
const { Telegraf } = require('telegraf');
const axios = require('axios');

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);


exports.makeOrder = async (req, res) => {
    try {
        const userId = req.body.user_id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        const baskets = await Basket.find({ user_id: userId, is_ordered: false }).populate('product_id');
        if (!baskets.length) return res.status(400).json({ msg: 'Savat bo‘sh' });

        let totalPrice = 0;
        const products = baskets.map((b) => {
            totalPrice += b.count * b.product_id.price;
            return {
                product_id: b.product_id._id,
                count: b.count
            };
        });

        const order = await Order.create({
            user_id: userId,
            products,
            total_price: totalPrice,
            phone: user.phone,
            status: "BUYURTMA"
        });

        await Basket.deleteMany({ user_id: userId, is_ordered: false });

        let msg = `🛒 <b>Yangi buyurtma!</b>\n\n`;
        baskets.forEach((item) => {
            msg += `📦 <b>${item.product_id.name}</b> × ${item.count} = <b>${item.count * item.product_id.price}</b> so'm\n`;
        });
        msg += `\n💰 <b>Umumiy:</b> ${totalPrice} so'm`;
        msg += `\n👤 <b>Ism:</b> ${user.name}`;
        msg += `\n📞 <b>Tel:</b> ${user.phone}`;
        if (user?.location?.latitude && user?.location?.longitude) {
            msg += `\n📍 <b>Lokatsiya:</b> <a href="https://www.google.com/maps?q=${user.location.latitude},${user.location.longitude}">Xaritada ochish</a>`;
        }

        await bot.telegram.sendMessage(process.env.ADMIN_CHANNEL_ID, msg, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        res.json({ msg: 'Buyurtma qabul qilindi', order });

    } catch (err) {
        console.error('makeOrder xatoligi:', err);
        res.status(500).json({ msg: 'Server xatoligi', detail: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Order.countDocuments();
        const orders = await Order.find()
            .populate('user_id')
            .populate('products.product_id')
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit);

        res.json({
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            orders,
        });
    } catch (e) {
        console.error('getAllOrders error:', e.message);
        res.status(500).json({msg: 'Server xatoligi'});
    }
};

exports.getUserOrderHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const history = await OrderHistory.find({user_id: userId})
            .populate('order_id')
            .sort({createdAt: -1});

        res.json({history});
    } catch (err) {
        console.error('Tarix olishda xatolik:', err.message);
        res.status(500).json({msg: 'Server xatoligi'});
    }
};
exports.getOrdersByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ user_id: userId })
            .populate('products.product_id')
            .sort({ createdAt: -1 });

        const activeOrders = [];

        for (const order of orders) {
            const isFinished =
                order.status === 'BEKOR QILINDI' ||
                order.status === 'FOYDALANUVCHI QABUL QILDI';

            if (isFinished) {
                // 🔐 Tarixda mavjud emasligini tekshiramiz
                const exists = await OrderHistory.findOne({ order_id: order._id });
                if (!exists) {
                    await OrderHistory.create({
                        order_id: order._id,
                        user_id: userId,
                        status: order.status,
                        cancel_reason: order.cancel_reason || undefined,
                    });
                }

                await Order.findByIdAndDelete(order._id);
            } else {
                activeOrders.push(order);
            }
        }

        res.json({ orders: activeOrders });
    } catch (err) {
        console.error('User orderlari xatosi:', err.message);
        res.status(500).json({ msg: 'Server xatoligi' });
    }
};

const sendTelegramMessage = async (chatId, text) => {
    try {
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Telegramga yuborishda xatolik:', error.message);
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, cancel_reason, canceled_by } = req.body;

        const order = await Order.findById(orderId)
            .populate('products.product_id')
            .populate('user_id');
        if (!order) return res.status(404).json({ msg: 'Order topilmadi' });

        const validStatuses = [
            'BUYURTMA',
            'QABUL QILINDI',
            'QADOQLANMOQDA',
            'YETKAZILMOQDA',
            'YETIB KELDI',
            'HARIDOR QABUL QILDI',
            'BEKOR QILINDI'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Yaroqsiz status' });
        }

        order.status = status;
        if (status === 'BEKOR QILINDI') {
            order.cancel_reason = cancel_reason;
        } else {
            order.cancel_reason = undefined;
        }

        await order.save();

        // ➤ Telegramga xabar
        const user = order.user_id;
        if (user?.chatId) {
            let message = `📦 <b>Buyurtma statusi yangilandi</b>\n🆔 Buyurtma ID: <code>${order._id}</code>\n🟡 Yangi status: <b>${status}</b>`;

            if (status === 'BEKOR QILINDI' && cancel_reason) {
                message += `\n❌ Bekor sababi: ${cancel_reason}`;
            }

            await sendTelegramMessage(user.chatId, message);
        }

        // ➤ Tarixga yozish
        if (status === 'BEKOR QILINDI' || status === 'HARIDOR QABUL QILDI') {
            await OrderHistory.create({
                order_id: order._id,
                user_id: user._id,
                status: status === 'BEKOR QILINDI'
                    ? `${canceled_by || ''} BEKOR QILINDI`
                    : 'HARIDOR QABUL QILDI',
                cancel_reason: cancel_reason || undefined
            });
        }

        res.json({ msg: 'Status yangilandi', order });
    } catch (err) {
        console.error('Status yangilashda xatolik:', err.message);
        res.status(500).json({ msg: 'Server xatoligi' });
    }
};



exports.cancelByAdmin = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {reason} = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({msg: 'Order topilmadi'});

        order.status = 'BEKOR QILINDI';
        order.cancel_reason = reason;
        await order.save();

        await OrderHistory.create({
            order_id: order._id,
            user_id: order.user_id,
            status: 'Admin tomonidan bekor qilindi',
            cancel_reason: reason,
        });

        const user = await User.findById(order.user_id);
        if (user?.chatId) {
            const msg = `❌ Buyurtmangiz bekor qilindi.\n📝 Sabab: ${reason}`;
            await adminBot.telegram.sendMessage(user.chatId, msg);
        }

        res.json({msg: 'Admin tomonidan buyurtma bekor qilindi', order});
    } catch (err) {
        console.error('cancelByAdmin xatolik:', err.message);
        res.status(500).json({msg: 'Server xatoligi'});
    }
};

exports.cancelByUser = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {reason} = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({msg: 'Order topilmadi'});
        if (order.status !== "SO'ROV") return res.status(403).json({msg: 'Bu statusda bekor qilib bo‘lmaydi'});

        order.status = 'BEKOR QILINDI';
        order.cancel_reason = reason;
        await order.save();

        await OrderHistory.create({
            order_id: order._id,
            user_id: order.user_id,
            status: 'Foydalanuvchi tomonidan bekor qilindi',
            cancel_reason: reason,
        });

        res.json({msg: 'Bekor qilindi', order});
    } catch (err) {
        console.error('cancelByUser xatolik:', err.message);
        res.status(500).json({msg: 'Server xatoligi'});
    }
};