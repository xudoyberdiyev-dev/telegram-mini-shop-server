const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const controller = require('../controller/categoryController');

router.post('/', upload.single('file'), controller.createCategory);
router.get('/', controller.getAllCategories);
router.put('/:id', upload.single('file'), controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
