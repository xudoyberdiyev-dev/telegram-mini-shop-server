const mongoose = require('mongoose');
const Basket = require('../models/Basket');
const Product = require('../models/Product');
const User = require('../models/User'); // agar kerak bo‘lsa

exports.addToBasket = async (req, res) => {
    try {
        let { user_id, product_id, count } = req.body;

        // 🛡️ ObjectId validligini tekshiramiz
        if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(product_id)) {
            return res.status(400).json({ error: 'Noto‘g‘ri user_id yoki product_id' });
        }

        count = parseInt(count) > 0 ? parseInt(count) : 1;

        const existingBasket = await Basket.findOne({
            user_id,
            product_id,
            is_ordered: false,
        });

        if (existingBasket) {
            existingBasket.count += count;
            await existingBasket.save();
            res.json({ message: 'Mahsulot soni yangilandi', basket: existingBasket });
        } else {
            const basket = new Basket({
                user_id,
                product_id,
                count,
            });

            await basket.save();
            res.json({ message: 'Mahsulot savatchaga qo‘shildi', basket });
        }
    } catch (err) {
        console.error('Xatolik:', err); // 🪵 Log
        res.status(500).json({ error: 'Xatolik yuz berdi', detail: err.message });
    }
};

exports.getUserBasket = async (req, res) => {
    try {
        const baskets = await Basket.find({ user_id: req.params.userId, is_ordered: false })
            .populate('product_id');

        const basketWithDetails = baskets.map(item => {
            const product = item.product_id;
            const singlePrice = product.price;
            const totalPrice = singlePrice * item.count;

            return {
                _id: item._id,
                product: {
                    _id: product._id, // ✅ Shu yer muhim!
                    name: product.name,
                    image: product.image,
                    price: singlePrice,
                },
                count: item.count,
                total_price: totalPrice,
            };
        });

        const totalBasketPrice = basketWithDetails.reduce((acc, item) => acc + item.total_price, 0);

        res.json({
            products: basketWithDetails,
            totalPrice: totalBasketPrice,
        });
    } catch (err) {
        res.status(500).json({ error: 'Xatolik', detail: err.message });
    }
};

// controllers/basketController.js
exports.updateBasketCount = async (req, res) => {
    try {
        const { basketId, newCount } = req.body;

        if (!basketId || newCount < 1) {
            return res.status(400).json({ message: "Noto‘g‘ri ma’lumot" });
        }

        const basket = await Basket.findById(basketId);

        if (!basket || basket.is_ordered) {
            return res.status(404).json({ message: "Savat topilmadi" });
        }

        basket.count = newCount;
        await basket.save();

        res.json({ message: "Mahsulot soni yangilandi", basket });
    } catch (err) {
        res.status(500).json({ error: "Xatolik yuz berdi", detail: err.message });
    }
};



exports.removeMultipleFromBasket = async (req, res) => {
    try {
        const { basketIds } = req.body;

        if (!Array.isArray(basketIds) || basketIds.length === 0) {
            return res.status(400).json({ message: 'O‘chiriladigan IDlar ro‘yxatini yuboring' });
        }

        await Basket.deleteMany({ _id: { $in: basketIds }, is_ordered: false });

        res.json({ message: 'Tanlangan mahsulotlar savatdan o‘chirildi' });
    } catch (err) {
        res.status(500).json({ error: 'Xatolik yuz berdi', detail: err.message });
    }
};
