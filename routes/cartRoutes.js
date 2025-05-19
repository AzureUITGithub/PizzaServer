const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/getCart', authMiddleware, cartController.getCart);
router.post('/addToCart', authMiddleware, cartController.addToCart);
router.delete('/clearCart', authMiddleware, cartController.clearCart);

module.exports = router;