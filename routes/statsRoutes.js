const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../utils/authMiddleware');
const isAdmin = require('../utils/isAdmin');

// Get average order value
router.get('/average-order-value', authMiddleware, isAdmin, statsController.getAverageOrderValue);

// Get order count by status
router.get('/order-count-by-status', authMiddleware, isAdmin, statsController.getOrderCountByStatus);

// Get top active users
router.get('/top-active-users', authMiddleware, isAdmin, statsController.getTopActiveUsers);

// Get revenue by day
router.get('/revenue-by-day', authMiddleware, isAdmin, statsController.getRevenueByDay);

// Get total revenue
router.get('/total-revenue', authMiddleware, isAdmin, statsController.getTotalRevenue);

// Get top selling products
router.get('/top-selling-products', authMiddleware, isAdmin, statsController.getTopSellingProducts);

module.exports = router;