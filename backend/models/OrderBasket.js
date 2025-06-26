const mongoose = require('mongoose');

const orderBasketSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    basketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Basket',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderBasket', orderBasketSchema);
