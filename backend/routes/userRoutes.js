const express = require('express');
const router = express.Router();
const userController = require('../controller/userController'); // controller faylingiz shu nomda bo‘lsa

router.get('/user/by-chatId/:chatI', userController.getUserByChatId);

module.exports = router;
