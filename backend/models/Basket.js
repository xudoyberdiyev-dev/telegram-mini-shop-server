const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    count: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    isOrdered: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Basket', basketSchema);
