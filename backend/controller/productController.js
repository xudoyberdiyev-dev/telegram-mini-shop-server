const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ msg: "Rasm yuboring" });

        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'products'
        });

        const product = new Product({
            name,
            price,
            description,
            image: result.secure_url,
            category
        });

        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ msg: "Mahsulot topilmadi" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const file = req.file;
        const updateData = { name, price, description, category };

        if (file) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'products'
            });
            updateData.image = result.secure_url;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: "Mahsulot o‘chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
