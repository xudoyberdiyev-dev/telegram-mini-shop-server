const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            count: {
                type: Number,
                required: true,
            },
        },
    ],
    total_price: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['BUYURTMA', 'QABUL QILINDI', 'QADOQLANMOQDA', 'YETKAZILMOQDA', 'YETIB KELDI', 'HARIDOR QABUL QILDI', 'BEKOR QILINDI'],
        default: "BUYURTMA"
    },
    cancel_reason: String,
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);