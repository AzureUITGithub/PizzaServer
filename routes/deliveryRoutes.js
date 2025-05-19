const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/createDelivery', authMiddleware, deliveryController.createDelivery);
router.get('/getDelivery/:id', authMiddleware, deliveryController.getDelivery);
router.put('/confirmDelivery/:id', authMiddleware, deliveryController.confirmDelivery);

module.exports = router;