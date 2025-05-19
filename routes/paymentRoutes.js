const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/initiatePayment', authMiddleware, paymentController.initiatePayment);
router.post('/paymentCallback', paymentController.paymentCallback);

module.exports = router;