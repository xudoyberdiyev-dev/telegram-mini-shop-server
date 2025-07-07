const mongoose = require('mongoose');

const orderHistorySchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true },
    cancel_reason: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrderHistory', orderHistorySchema);
