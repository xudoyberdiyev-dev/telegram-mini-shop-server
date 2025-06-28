const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController'); // controller faylingiz shu nomda bo‘lsa

// POST: Buyurtma berish
router.post('/makeOrder', orderController.makeOrder);

// GET: Barcha buyurtmalarni olish (admin uchun)
router.get('/getAllOrders', orderController.getAllOrders);

module.exports = router;
