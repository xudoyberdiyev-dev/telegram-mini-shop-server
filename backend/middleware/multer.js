// middlewares/upload.js
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadPath = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {recursive: true})
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
        cb(null, uniqueName)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('❌ Ruxsat etilmagan rasm formati!'));
    }
};
module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

// const multer = require('multer');
// const path = require('path');

// // Har bir fayl nomi noyob bo'lishi uchun vaqt qo‘shiladi
// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // masalan: 1719563782.png
//     }
// });

// const fileFilter = (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
//         cb(null, true);
//     } else {
//         cb(new Error("Faqat rasm fayllari yuklanadi!"));
//     }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;
