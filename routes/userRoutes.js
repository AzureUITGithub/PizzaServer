const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../utils/authMiddleware');
const isAdmin = require('../utils/isAdmin');

// Chỉ admin có thể xem tất cả người dùng
router.get('/getAllUser', authMiddleware, isAdmin, userController.getAllUsers);

// User hoặc admin xem thông tin user (kiểm tra quyền trong controller)
router.get('/getUser/:id', authMiddleware, userController.getUserById);

// User hoặc admin cập nhật thông tin (kiểm tra quyền trong controller)
router.put('/updateUser/:id', authMiddleware, userController.updateUser);

// Chỉ admin có thể xóa bất kỳ user (kiểm tra quyền trong controller cho user tự xóa)
router.delete('/deleteUser/:id', authMiddleware, userController.deleteUser);

// Đăng xuất - yêu cầu xác thực
router.post('/logout', authMiddleware, userController.logout);

// Các tuyến đường công khai
router.post('/createUser', userController.createUser);            // Đăng ký
router.post('/login', userController.login);                      // Đăng nhập
router.post('/forget-password', userController.forgetPassword);   // Quên mật khẩu
router.post('/reset-password', userController.resetPassword);     // Đổi mật khẩu
router.post('/verify-code', userController.verifyResetCode); // Xác minh mã reset mật khẩu

module.exports = router;