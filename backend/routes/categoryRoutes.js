const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const controller = require('../controller/categoryController');

router.post('/', upload.single('image'), controller.createCategory);
router.get('/', controller.getAllCategories);
router.put('/:id', upload.single('image'), controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
