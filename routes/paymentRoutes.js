const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../utils/authMiddleware');
const isAdmin = require('../utils/isAdmin');

router.post('/initiatePayment', authMiddleware, paymentController.initiatePayment);
router.post('/paymentCallback', paymentController.paymentCallback);
router.get('/getAllPayments', authMiddleware, isAdmin, paymentController.getAllPayments);

module.exports = router;