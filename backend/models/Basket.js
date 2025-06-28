// models/Basket.js
const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    count: {type: Number, default: 1},
    is_ordered: {type: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.model('Basket', basketSchema);
