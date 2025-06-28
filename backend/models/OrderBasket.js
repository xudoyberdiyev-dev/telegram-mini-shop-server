// models/OrderBasket.js
const mongoose = require('mongoose');

const orderBasketSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    basket_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Basket' },
});

module.exports = mongoose.model('OrderBasket', orderBasketSchema);
