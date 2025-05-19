const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    pizzas: [{
        pizzaId: { type: mongoose.Schema.Types.ObjectId, ref: 'pizza', required: false }, // If using an existing pizza
        customPizza: {
            name: { type: String, required: false },
            description: { type: String, required: false },
            size: { type: String, required: false },
            crust_type: { type: String, required: false },
            toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'topping' }],
            base_price: { type: Number, required: false },
            image_url: { type: String, required: false }
        },
        quantity: { type: Number, default: 1 }
    }],
    drinks: [{
        drinkId: { type: mongoose.Schema.Types.ObjectId, ref: 'drink', required: false },
        quantity: { type: Number, default: 1 }
    }],
    sides: [{
        sideId: { type: mongoose.Schema.Types.ObjectId, ref: 'side', required: false },
        quantity: { type: Number, default: 1 }
    }],
    salads: [{
        saladId: { type: mongoose.Schema.Types.ObjectId, ref: 'salad', required: false },
        quantity: { type: Number, default: 1 }
    }],
    total_price: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('cart', cartSchema);