const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true // createdAt va updatedAt avtomatik bo'ladi
    });

module.exports = mongoose.model('Category', categorySchema);
