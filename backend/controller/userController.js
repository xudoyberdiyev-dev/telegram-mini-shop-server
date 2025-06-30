// GET /user/by-chatId/:chatId
exports.getUserByChatId = async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.chatId });
        if (!user) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        return res.json({ _id: user._id, name: user.name, phone: user.phone });
    } catch (err) {
        return res.status(500).json({ msg: 'Xatolik', error: err.message });
    }
};
