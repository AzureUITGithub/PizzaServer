const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    base_price: { type: Number, required: true },
    image_url: { type: String, required: false } 
});

module.exports = mongoose.model('topping', toppingSchema);