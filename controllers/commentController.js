const Comment = require('../models/comment');
const Delivery = require('../models/delivery');

exports.createComment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const deliveryId = req.params.deliveryId;
        const { pizzaId, comment } = req.body;

        if (!pizzaId || !comment) {
            return res.status(400).json({ error: 'pizzaId and comment are required' });
        }

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (delivery.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only comment on your own deliveries' });
        }

        if (delivery.status !== 'delivered') {
            return res.status(400).json({ error: 'Cannot comment until delivery is confirmed' });
        }

        const orderPizza = delivery.order.pizzas.find(p => 
            p.pizzaId?.toString() === pizzaId || 
            (p.customPizza && p.customPizza.pizzaId?.toString() === pizzaId)
        );
        if (!orderPizza) {
            return res.status(400).json({ error: 'Invalid pizzaId for this delivery' });
        }

        const newComment = new Comment({
            deliveryId,
            pizzaId,
            userId,
            comment
        });
        await newComment.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCommentsByDelivery = async (req, res) => {
    try {
        const deliveryId = req.params.deliveryId;
        const comments = await Comment.find({ deliveryId })
            .populate('pizzaId')
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
            .populate('pizzaId')
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
            .populate('pizzaId')
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