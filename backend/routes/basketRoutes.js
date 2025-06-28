const express = require('express');
const router = express.Router();
const basketController = require('../controller/basketController');

router.post('/add', basketController.addToBasket);

router.get('/:userId', basketController.getUserBasket);

router.post('/remove-multiple', basketController.removeMultipleFromBasket);
router.post('/update-count', basketController.updateBasketCount);


module.exports = router;
