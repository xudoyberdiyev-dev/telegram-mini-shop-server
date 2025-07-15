const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
exports.createCategory = async (req, res) => {
    try {
        const {name} = req.body;
        const file = req.file?.filename || ''

        if (!file) return res.status(400).json({msg: "Rasm yuboring"});

        const existing = await Category.findOne({
            name: {$regex: new RegExp(`^${name.trim()}$`, 'i')}
        });

        if (existing) {
            return res.status(400).json({msg: "Bunday nomli kategoriya allaqachon mavjud!"});
        }

        // const result = await cloudinary.uploader.upload(file.path, {
        //     folder: "categories"
        // });

        const category = new Category({
            name: name.trim(),
            image: file
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({createdAt: -1});
        res.json(categories);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Kategoriya topilmadi' });
        }

        let update = { name: name?.trim() || category.name };

        if (req.file) {
            if (category.image) {
                fs.unlinkSync(path.join('uploads', category.image));
            }
            update.image = req.file.filename;
        }

        const categoryUp = await Category.findByIdAndUpdate(id, update, { new: true });
        res.json({ category: categoryUp });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const products = await Product.find({category: categoryId});

        if (products.length > 0) {
            return res.status(400).json({
                error: "Bu bo‘limda mahsulotlar mavjud, avval ularni o‘chiring",
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({error: "Kategoriya topilmadi"});
        }

        if (category.image) {
            fs.unlinkSync(path.join('uploads', category.image));
        }

        await Category.findByIdAndDelete(categoryId);

        res.json({msg: "Kategoriya o‘chirildi"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};
