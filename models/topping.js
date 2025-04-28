const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    base_price: { type: Number, required: true }
});

module.exports = mongoose.model('topping', toppingSchema);