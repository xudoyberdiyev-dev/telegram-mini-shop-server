const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const file = req.file?.filename || ''

        if (!file) return res.status(400).json({ msg: "Rasm yuboring" });

        // const result = await cloudinary.uploader.upload(file.path, {
        //     folder: 'products'
        // });

        const product = new Product({
            name,
            price,
            description,
            image: file,
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
exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const products = await Product.find({ category: categoryId }).populate('category');
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

exports.getPaginatedProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // eng yangi birinchi

        res.json({
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            products,
        });
    } catch (err) {
        res.status(500).json({ error: 'Xatolik yuz berdi', detail: err.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const file = req.file;

        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: 'Topilmadi' })
        let updateDate;
        if (req.file) {
            if (product.image) {
                fs.unlinkSync(path.join('uploads', product.image)); // Eski rasmni o'chirish
            }
            category.image = req.file.filename
            updateDate = { name, price, description, category, image: category.image };
        }
        // if (file) {
        //     const result = await cloudinary.uploader.upload(file.path, {
        //         folder: 'products'
        //     });
        //     updateData.image = result.secure_url;
        // }

        const productUp = await Product.findByIdAndUpdate(req.params.id, updateDate, { new: true });
        res.json({ product: productUp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product.image) {
            fs.unlinkSync(path.join('uploads', product.image)); // Eski rasmni o'chirish
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: "Mahsulot o‘chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.query; // ?query=non

        if (!query) {
            return res.status(400).json({ msg: "Qidiruv so'zi yuborilmadi" });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).populate('category');

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
