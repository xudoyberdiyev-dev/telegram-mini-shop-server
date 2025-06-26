const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String, // Cloudinary URL yoki boshqa rasm manzili
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}, {
    timestamps: true // createdAt va updatedAt avtomatik bo'ladi
});

module.exports = mongoose.model('Product', productSchema);
