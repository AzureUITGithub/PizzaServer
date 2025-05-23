const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'delivery', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comment', commentSchema);