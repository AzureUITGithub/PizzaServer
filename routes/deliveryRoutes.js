const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../utils/authMiddleware');
const commentController = require('../controllers/commentController'); 
const isAdmin = require('../utils/isAdmin');

router.post('/createDelivery', authMiddleware, deliveryController.createDelivery);
router.get('/getDelivery/:id', authMiddleware, deliveryController.getDelivery);
router.get('/getAllDeliveredDeliveries', authMiddleware, deliveryController.getAllDeliveredDeliveries);
router.put('/confirmDelivery/:id', authMiddleware, deliveryController.confirmDelivery);
router.post('/addComment/:deliveryId', authMiddleware, commentController.createComment);
router.get('/comments/:deliveryId', authMiddleware, commentController.getCommentsByDelivery);
router.get('/allComments', authMiddleware, commentController.getAllComments);
router.put('/updateComment/:commentId', authMiddleware, commentController.updateComment);
router.delete('/deleteComment/:commentId', authMiddleware, commentController.deleteComment);
router.get('/allCommentsAdmin', authMiddleware, isAdmin, commentController.getAllCommentsAdmin); // New route

module.exports = router;