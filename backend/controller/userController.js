const User = require('../models/User');

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
        res.json(user);
    } catch (err) {
        console.error("getUserById error:", err);
        res.status(500).json({ msg: "Server xatosi" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
        res.json(updatedUser);
    } catch (err) {
        console.error("updateUser error:", err);
        res.status(500).json({ msg: "Ma’lumot yangilanmadi" });
    }
};
