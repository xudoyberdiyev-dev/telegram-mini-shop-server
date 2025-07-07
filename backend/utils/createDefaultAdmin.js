// utils/createDefaultAdmin.js
const Admin = require('../models/Admin');

const createDefaultAdmin = async () => {
    const defaultPhone = process.env.ADMIN_PHONE;
    const defaultPassword = process.env.ADMIN_PASSWORD;

    const exists = await Admin.findOne({phone: defaultPhone});
    if (!exists) {
        const newAdmin = new Admin({
            fullName: 'Super Admin',
            phone: defaultPhone,
            password: defaultPassword
        });

        await newAdmin.save();
        console.log('✅ Default admin yaratildi');
    } else {
        console.log('ℹ️ Admin allaqachon mavjud');
    }
};

module.exports = createDefaultAdmin;
