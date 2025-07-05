const Basket = require('../models/Basket');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { adminBot } = require('../bot/bot');
const User = require('../models/User');

exports.makeOrder = async (req, res) => {
    try {
        const userId = req.body.user_id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

        const baskets = await Basket.find({ user_id: userId, is_ordered: false }).populate('product_id');
        if (!baskets.length) return res.status(400).json({ msg: "Savat bo‘sh" });

        let totalPrice = 0;
        const products = baskets.map(b => {
            totalPrice += b.count * b.product_id.price;
            return { product_id: b.product_id._id, count: b.count };
        });

        const order = new Order({
            user_id: userId,
            products,
            total_price: totalPrice,
            phone: user.phone, // ✅ Bot orqali olingan raqam
        });
        await order.save();

        await Basket.deleteMany({ user_id: userId, is_ordered: false });

        // ✅ Admin kanalga xabar yuborish
        let msg = `🛒 <b>Yangi buyurtma!</b>\n\n`;
        for (const item of baskets) {
            msg += `📦 ${item.product_id.name} × ${item.count} = ${item.count * item.product_id.price} so'm\n`;
        }
        msg += `\n💰 Umumiy: ${totalPrice} so'm`;
        msg += `\n👤 Ism: ${user.name}`;
        msg += `\n📞 Tel: ${user.phone}`;

        await adminBot.telegram.sendMessage(process.env.ADMIN_CHANNEL_ID, msg, { parse_mode: 'HTML' });

        return res.json({ msg: "Buyurtma qabul qilindi", order });
    } catch (err) {
        console.error("makeOrder error:", err.message);
        return res.status(500).json({ msg: "Server xatoligi", detail: err.message });
    }
};




exports.getAllOrders = async (req, res) => {
    const chatId = req.query.chatId;

    // ✅ Chat ID tekshiruvi
    if (chatId !== process.env.ADMIN_CHAT_ID) {
        return res.status(403).json({ msg: "Ruxsat yo‘q" });
    }

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

