const Order = require('../models/Order');
const Basket = require('../models/Basket');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminBot } = require('../bot/bot');
const OrderHistory = require('../models/History');

// ✅ Buyurtma berish
exports.makeOrder = async (req, res) => {
    try {
        const userId = req.body.user_id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        const baskets = await Basket.find({ user_id: userId, is_ordered: false }).populate('product_id');
        if (!baskets.length) return res.status(400).json({ msg: 'Savat bo‘sh' });

        let totalPrice = 0;
        const products = baskets.map(b => {
            totalPrice += b.count * b.product_id.price;
            return { product_id: b.product_id._id, count: b.count };
        });

        const order = new Order({
            user_id: userId,
            products,
            total_price: totalPrice,
            phone: user.phone,
        });

        await order.save();
        await Basket.deleteMany({ user_id: userId, is_ordered: false });

        // 🔔 Telegram kanalga habar
        let msg = `🛒 <b>Yangi buyurtma!</b>\n\n`;
        baskets.forEach(item => {
            msg += `📦 ${item.product_id.name} × ${item.count} = ${item.count * item.product_id.price} so'm\n`;
        });
        msg += `\n💰 Umumiy: ${totalPrice} so'm`;
        msg += `\n👤 Ism: ${user.name}`;
        msg += `\n📞 Tel: ${user.phone}`;
        if (user.location?.latitude && user.location?.longitude) {
            msg += `\n📍 Lokatsiya: <a href="https://www.google.com/maps?q=${user.location.latitude},${user.location.longitude}">Xaritada ochish</a>`;
        }

        await adminBot.telegram.sendMessage(process.env.ADMIN_CHANNEL_ID, msg, { parse_mode: 'HTML' });

        res.json({ msg: 'Buyurtma qabul qilindi', order });
    } catch (err) {
        console.error('makeOrder error:', err.message);
        res.status(500).json({ msg: 'Server xatoligi', detail: err.message });
    }
};

// ✅ Barcha orderlar (admin uchun)
exports.getAllOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find()
        .populate('user_id')
        .populate('products.product_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        orders,
    });
};
exports.getUserOrderHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const history = await OrderHistory.find({ user_id: userId })
            .populate('order_id')
            .sort({ createdAt: -1 });

        res.json({ history });
    } catch (err) {
        console.error("Tarix olishda xatolik:", err.message);
        res.status(500).json({ msg: "Server xatoligi" });
    }
};


// ✅ Admin yoki user statusni yangilaydi

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, cancel_reason, canceled_by } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ msg: "Order topilmadi" });

        order.status = status;

        if (status === "BEKOR QILINDI" && cancel_reason) {
            order.cancel_reason = cancel_reason;
        }

        await order.save();

        // ✅ Tarixga yozish faqat oxirgi statuslarda:
        if (status === "FOYDALANUVCHI QABUL QILDI") {
            await OrderHistory.create({
                order_id: order._id,
                user_id: order.user_id,
                status
            });
        }

        if (status === "BEKOR QILINDI") {
            await OrderHistory.create({
                order_id: order._id,
                user_id: order.user_id,
                status: `${canceled_by || 'Nomaʼlum'} tomonidan bekor qilindi`,
                cancel_reason
            });
        }

        res.json({ msg: "Status yangilandi", order });

    } catch (err) {
        console.error("Status yangilashda xatolik:", err.message);
        res.status(500).json({ msg: "Server xatoligi" });
    }
};

// ✅ Admin tomonidan bekor qilish
exports.cancelByAdmin = async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, {
        status: "BEKOR QILINDI",
        cancel_reason: reason
    }, { new: true });

    if (!order) return res.status(404).json({ msg: "Buyurtma topilmadi" });

    const user = await User.findById(order.user_id);
    if (user?.chatId) {
        const msg = `❌ Buyurtmangiz bekor qilindi.\n📝 Sabab: ${reason}`;
        await adminBot.telegram.sendMessage(user.chatId, msg);
    }

    res.json({ msg: "Admin tomonidan buyurtma bekor qilindi", order });
};

// ✅ Foydalanuvchi tomonidan bekor qilish (faqat SO'ROV bo‘lsa)
exports.cancelByUser = async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Buyurtma topilmadi" });

    if (order.status !== "SO'ROV") {
        return res.status(403).json({ msg: "Bu statusda foydalanuvchi bekor qila olmaydi" });
    }

    order.status = "BEKOR QILINDI";
    order.cancel_reason = reason;
    await order.save();

    res.json({ msg: "Foydalanuvchi tomonidan bekor qilindi", order });
};
