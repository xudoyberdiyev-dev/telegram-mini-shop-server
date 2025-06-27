const multer = require('multer');
const path = require('path');

// Har bir fayl nomi noyob bo'lishi uchun vaqt qo‘shiladi
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // masalan: 1719563782.png
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
        cb(null, true);
    } else {
        cb(new Error("Faqat rasm fayllari yuklanadi!"));
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
