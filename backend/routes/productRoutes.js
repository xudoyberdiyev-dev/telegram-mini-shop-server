const express = require('express');
const router = express.Router();
const controller = require('../controller/productController');
const upload = require('../middleware/multer');

router.post('/', upload.single('image'), controller.createProduct);
router.get('/', controller.getAllProducts);
router.get('/:id', controller.getProductById);
router.put('/:id', upload.single('image'), controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
