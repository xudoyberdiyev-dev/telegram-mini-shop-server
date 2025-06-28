const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // ✅ shu joy muhim: 'User' modeli bilan bog‘laymiz
        required: true,
    },
    products: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // ✅ mahsulotni populate qilish uchun
                required: true,
            },
            count: {
                type: Number,
                required: true,
            },
        }
    ],
    total_price: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // ✅ bu ham kerak edi oldingi sorting uchun
});

module.exports = mongoose.model('Order', orderSchema);
