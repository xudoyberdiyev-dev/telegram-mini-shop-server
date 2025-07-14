const Category = require('../models/Category');
// const cloudinary = require('../utils/cloudinary');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file?.filename || ''

        if (!file) return res.status(400).json({ msg: "Rasm yuboring" });

        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({ msg: "Bunday nomli kategoriya allaqachon mavjud!" });
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
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await Category.findById(req.params.id)

        if (!category) return res.status(404).json({ message: 'Topilmadi' })
        let update;
        if (req.file) {
            if (category.image) {
                fs.unlinkSync(path.join('uploads', category.image)); // Eski rasmni o'chirish
            }
            category.image = req.file.filename
            update = { name: name.trim(), image: category.image };
        }

        // if (file) {
        //     const result = await cloudinary.uploader.upload(file.path, {
        //         folder: "categories"
        //     });
        //     update.image = result.secure_url;
        // }

        const categoryUp = await Category.findByIdAndUpdate(id, update, { new: true });
        res.json({ category: categoryUp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category.image) {
            fs.unlinkSync(path.join('uploads', category.image)); // Eski rasmni o'chirish
        }
        await Category.findByIdAndDelete(req.params.id);
        res.json({ msg: "Kategoriya o‘chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
