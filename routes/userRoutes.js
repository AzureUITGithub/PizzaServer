const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/getAllUser', userController.getAllUsers);
router.post('/createUser', userController.createUser);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.post('/forget-password', userController.forgetPassword);
router.get('/reset-password/:token', userController.showResetForm);
router.post('/reset-password', userController.resetPassword);

module.exports = router;