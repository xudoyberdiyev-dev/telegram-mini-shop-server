const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({}, {
    timestamps: true // createdAt va updatedAt bo‘ladi
});

module.exports = mongoose.model('Order', orderSchema);
