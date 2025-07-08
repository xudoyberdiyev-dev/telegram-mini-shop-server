const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// Zakaz qilish
router.post('/makeOrder', orderController.makeOrder);

// Barcha buyurtmalar
router.get('/getAllOrders', orderController.getAllOrders);
router.get('/user/:userId', orderController.getOrdersByUser);
router.get('/history/:userId', orderController.getUserOrderHistory);

// Statusni yangilash
router.put('/updateStatus/:orderId', orderController.updateOrderStatus);

// Admin bekor qilish
router.put('/cancelByAdmin/:orderId', orderController.cancelByAdmin);

// Foydalanuvchi bekor qilishi
router.put('/cancelByUser/:orderId', orderController.cancelByUser);

module.exports = router;
