const mongoose = require('mongoose');

const saladSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    base_price: { type: Number, required: true },
    image_url: { type: String, required: false } 
});

module.exports = mongoose.model('salad', saladSchema);