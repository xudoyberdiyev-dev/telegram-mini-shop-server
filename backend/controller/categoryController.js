const Category = require('../models/Category');
const cloudinary = require('../utils/cloudinary');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ msg: "Rasm yuboring" });

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "categories"
        });

        const category = new Category({
            name,
            image: result.secure_url
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const file = req.file;

        let update = { name };

        if (file) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "categories"
            });
            update.image = result.secure_url;
        }

        const category = await Category.findByIdAndUpdate(id, update, { new: true });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ msg: "Kategoriya o‘chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
