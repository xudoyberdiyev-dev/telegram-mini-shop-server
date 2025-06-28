const Basket = require('../models/Basket');
const Order = require('../models/Order');
const Product = require('../models/Product');
const bot = require('../bot/bot'); // bu yerda telegram bot chaqiriladi

exports.makeOrder = async (req, res) => {
    try {
        const userId = req.body.user_id;

        // basketdagi mahsulotlarni topamiz
        const baskets = await Basket.find({ user_id: userId, is_ordered: false }).populate('product_id');

        if (!baskets.length) return res.status(400).json({ msg: "Savat bo‘sh" });

        let totalPrice = 0;

        const products = baskets.map(b => {
            totalPrice += b.count * b.product_id.price;
            return {
                product_id: b.product_id._id,
                count: b.count
            };
        });

        // yangi order saqlaymiz
        const order = new Order({
            user_id: userId,
            products,
            total_price: totalPrice,
            phone: req.body.phone // foydalanuvchi raqami
        });

        await order.save();

        // savatdagi mahsulotlar o‘chiriladi
        await Basket.deleteMany({ user_id: userId, is_ordered: false });

        // Telegram kanalga xabar yuboramiz
        let message = `🛒 Yangi buyurtma!\n\n`;
        for (const item of baskets) {
            message += `📦 ${item.product_id.name} × ${item.count} = ${item.count * item.product_id.price} so'm\n`;
        }
        message += `\n💰 Umumiy: ${totalPrice} so'm\n📞 Tel: ${req.body.phone}`;

        await bot.telegram.sendMessage(process.env.ADMIN_CHANNEL_ID, message); // kanal ID .env faylda

        res.json({ msg: "Buyurtma qabul qilindi", order });

    } catch (err) {
        res.status(500).json({ error: "Xatolik", detail: err.message });
    }
};


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user_id').populate('products.product_id').sort({ created_at: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Xatolik', detail: err.message });
    }
};
