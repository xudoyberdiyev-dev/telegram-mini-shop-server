const express = require('express');
const router = express.Router();
const controller = require('../controller/productController');
const upload = require('../middleware/multer');

router.post('/', upload.single('file'), controller.createProduct);
router.get('/', controller.getAllProducts);
router.get('/search', controller.searchProducts);
router.get('/category/:categoryId', controller.getProductsByCategory);
router.get('/:id', controller.getProductById);
router.put('/:id', upload.single('file'), controller.updateProduct);
router.delete('/:id', controller.deleteProduct);


module.exports = router;
