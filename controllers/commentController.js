const Comment = require('../models/comment');
const Delivery = require('../models/delivery');

exports.createComment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const deliveryId = req.params.deliveryId;
        const { comment } = req.body;

        // Kiểm tra trường comment
        if (!comment) {
            return res.status(400).json({ error: 'Comment is required' });
        }

        // Kiểm tra giao hàng tồn tại
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // Kiểm tra quyền người dùng
        if (delivery.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only comment on your own deliveries' });
        }

        // Kiểm tra trạng thái giao hàng
        if (delivery.status !== 'delivered') {
            return res.status(400).json({ error: 'Cannot comment until delivery is confirmed' });
        }

        // Tạo comment mới
        const newComment = new Comment({
            deliveryId,
            userId,
            comment
        });
        await newComment.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Các hàm khác giữ nguyên
exports.getCommentsByDelivery = async (req, res) => {
    try {
        const deliveryId = req.params.deliveryId;
        const comments = await Comment.find({ deliveryId })
            .populate('userId');
        if (!comments.length) {
            return res.status(404).json({ error: 'No comments found for this delivery' });
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllComments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const comments = await Comment.find({ userId })
            .populate('deliveryId')
            .populate('userId');
        if (!comments.length) {
            return res.status(404).json({ error: 'No comments found for this user' });
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCommentsAdmin = async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('deliveryId')
            .populate('userId');
        if (!comments.length) {
            return res.status(404).json({ error: 'No comments found' });
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const commentId = req.params.commentId;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const existingComment = await Comment.findById(commentId);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (existingComment.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only update your own comments' });
        }

        existingComment.comment = comment;
        await existingComment.save();

        res.json({ message: 'Comment updated successfully', comment: existingComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const commentId = req.params.commentId;

        const existingComment = await Comment.findById(commentId);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (existingComment.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only delete your own comments' });
        }

        await Comment.deleteOne({ _id: commentId });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};