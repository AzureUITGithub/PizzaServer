const Cart = require('../models/cart');
const Pizza = require('../models/pizza');
const Drink = require('../models/drink');
const Side = require('../models/side');
const Salad = require('../models/salad');
const Topping = require('../models/topping');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId })
            .populate('pizzas.pizzaId')
            .populate('pizzas.customPizza.toppings')
            .populate('drinks.drinkId')
            .populate('sides.sideId')
            .populate('salads.saladId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pizza, drinks, sides, salads } = req.body;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, pizzas: [], drinks: [], sides: [], salads: [], total_price: 0 });
        }

        let totalPrice = cart.total_price || 0;

        // Handle Pizza (either existing or custom)
        if (pizza) {
            let pizzaPrice = 0;
            if (pizza.pizzaId) {
                const existingPizza = await Pizza.findById(pizza.pizzaId);
                if (!existingPizza) {
                    return res.status(404).json({ error: 'Pizza not found' });
                }
                pizzaPrice = existingPizza.base_price * (pizza.quantity || 1);
                cart.pizzas.push({ pizzaId: pizza.pizzaId, quantity: pizza.quantity || 1 });
            } else if (pizza.customPizza) {
                const { name, description, size, crust_type, toppings, base_price } = pizza.customPizza;
                const toppingDocs = await Topping.find({ _id: { $in: toppings } });
                const toppingBasePrice = toppingDocs.reduce((sum, topping) => sum + (topping.base_price || 0), 0);
                pizzaPrice = (base_price + toppingBasePrice) * (pizza.quantity || 1);
                cart.pizzas.push({
                    customPizza: { name, description, size, crust_type, toppings, base_price },
                    quantity: pizza.quantity || 1
                });
            }
            totalPrice += pizzaPrice;
        }

        // Handle Drinks
        if (drinks && drinks.length > 0) {
            for (const drink of drinks) {
                const drinkDoc = await Drink.findById(drink.drinkId);
                if (!drinkDoc) {
                    return res.status(404).json({ error: 'Drink not found' });
                }
                const drinkPrice = drinkDoc.base_price * (drink.quantity || 1);
                cart.drinks.push({ drinkId: drink.drinkId, quantity: drink.quantity || 1 });
                totalPrice += drinkPrice;
            }
        }

        // Handle Sides
        if (sides && sides.length > 0) {
            for (const side of sides) {
                const sideDoc = await Side.findById(side.sideId);
                if (!sideDoc) {
                    return res.status(404).json({ error: 'Side not found' });
                }
                const sidePrice = sideDoc.base_price * (side.quantity || 1);
                cart.sides.push({ sideId: side.sideId, quantity: side.quantity || 1 });
                totalPrice += sidePrice;
            }
        }

        // Handle Salads (optional)
        if (salads && salads.length > 0) {
            for (const salad of salads) {
                const saladDoc = await Salad.findById(salad.saladId);
                if (!saladDoc) {
                    return res.status(404).json({ error: 'Salad not found' });
                }
                const saladPrice = saladDoc.base_price * (salad.quantity || 1);
                cart.salads.push({ saladId: salad.saladId, quantity: salad.quantity || 1 });
                totalPrice += saladPrice;
            }
        }

        cart.total_price = totalPrice;
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        await Cart.deleteOne({ userId });
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};