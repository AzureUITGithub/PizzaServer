const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true },
    base_price: { type: Number, required: true }
});

module.exports = mongoose.model('topping', toppingSchema);