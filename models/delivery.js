const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    order: {
        pizzas: [{
            pizzaId: { type: mongoose.Schema.Types.ObjectId, ref: 'pizza', required: false },
            customPizza: {
                pizzaId: { type: mongoose.Schema.Types.ObjectId, ref: 'pizza', required: true }, // Add this
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
        total_price: { type: Number, required: true }
    },
    address: { type: String, required: true },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
    tracking_url: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date, required: false } // New field for confirmation timestamp
});

module.exports = mongoose.model('delivery', deliverySchema);