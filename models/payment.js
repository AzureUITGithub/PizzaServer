const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    orderId: { type: String, required: true },
    requestId: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paymentUrl: { type: String, required: false }, // URL to redirect user to MoMo payment
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('payment', paymentSchema);