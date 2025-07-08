const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authAdmin = require('../middleware/authAdmin');

router.get("/profile", authAdmin, adminController.getAdminProfile);
router.post('/login', adminController.loginAdmin);
router.put('/update', authAdmin, adminController.updateAdmin);
router.post('/add', authAdmin, adminController.createAdmin);

module.exports = router;
