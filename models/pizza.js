const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    size: { type: String, required: true },
    crust_type: { type: String, required: true },
    toppings: [{ type: String, required: true }], 
    base_price: { type: Number, required: true },
    image_url: { type: String, required: false }
});

module.exports = mongoose.model('pizza', pizzaSchema);
