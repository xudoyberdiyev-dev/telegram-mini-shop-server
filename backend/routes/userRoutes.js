const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');

router.get('/:id', UserController.getUserById);

router.put('/:id', UserController.updateUser);

module.exports = router;
