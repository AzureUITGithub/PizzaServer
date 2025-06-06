const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/getCart', authMiddleware, cartController.getCart);
router.post('/addToCart', authMiddleware, cartController.addToCart);
router.post('/clearCart', authMiddleware, cartController.clearCart);
router.put('/updateCartItem', authMiddleware, cartController.updateCartItemQuantity);
router.post('/deleteCartItem', authMiddleware, cartController.deleteCartItem);

module.exports = router;