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
                const { pizzaId, size, crust_type, toppings, quantity } = pizza.customPizza;
                if (!pizzaId) {
                    return res.status(400).json({ error: 'pizzaId is required for custom pizza' });
                }
                const basePizza = await Pizza.findById(pizzaId);
                if (!basePizza) {
                    return res.status(404).json({ error: 'Base pizza not found' });
                }
                // Use base pizza's name and base_price, ignore user-provided name or base_price
                const toppingDocs = await Topping.find({ _id: { $in: toppings || [] } });
                const toppingBasePrice = toppingDocs.reduce((sum, topping) => sum + (topping.base_price || 0), 0);
                pizzaPrice = (basePizza.base_price + toppingBasePrice) * (quantity || 1);
                cart.pizzas.push({
                    customPizza: {
                        pizzaId: basePizza._id,
                        name: basePizza.name, // Use pizza name from collection
                        description: basePizza.description,
                        size: size || basePizza.size, // Default to base pizza size if not provided
                        crust_type: crust_type || 'regular', // Default to 'regular' if not provided
                        toppings: toppings || [],
                        base_price: basePizza.base_price // Use base pizza price from collection
                    },
                    quantity: quantity || 1
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

exports.updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemType, itemIndex, quantity } = req.body;

        if (!itemType || itemIndex === undefined || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'itemType, itemIndex, and a positive quantity are required' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        let updated = false;
        let newTotalPrice = cart.total_price;

        switch (itemType.toLowerCase()) {
            case 'pizza':
                if (itemIndex >= 0 && itemIndex < cart.pizzas.length) {
                    const pizza = cart.pizzas[itemIndex];
                    let basePrice = 0;
                    if (pizza.pizzaId) {
                        const existingPizza = await Pizza.findById(pizza.pizzaId);
                        basePrice = existingPizza.base_price;
                    } else if (pizza.customPizza) {
                        const toppingDocs = await Topping.find({ _id: { $in: pizza.customPizza.toppings || [] } });
                        const toppingBasePrice = toppingDocs.reduce((sum, topping) => sum + (topping.base_price || 0), 0);
                        basePrice = pizza.customPizza.base_price + toppingBasePrice;
                    }
                    const priceDiff = basePrice * (quantity - pizza.quantity);
                    pizza.quantity = quantity;
                    newTotalPrice += priceDiff;
                    updated = true;
                }
                break;
            case 'drink':
                if (itemIndex >= 0 && itemIndex < cart.drinks.length) {
                    const drink = cart.drinks[itemIndex];
                    const drinkDoc = await Drink.findById(drink.drinkId);
                    const priceDiff = drinkDoc.base_price * (quantity - drink.quantity);
                    drink.quantity = quantity;
                    newTotalPrice += priceDiff;
                    updated = true;
                }
                break;
            case 'side':
                if (itemIndex >= 0 && itemIndex < cart.sides.length) {
                    const side = cart.sides[itemIndex];
                    const sideDoc = await Side.findById(side.sideId);
                    const priceDiff = sideDoc.base_price * (quantity - side.quantity);
                    side.quantity = quantity;
                    newTotalPrice += priceDiff;
                    updated = true;
                }
                break;
            case 'salad':
                if (itemIndex >= 0 && itemIndex < cart.salads.length) {
                    const salad = cart.salads[itemIndex];
                    const saladDoc = await Salad.findById(salad.saladId);
                    const priceDiff = saladDoc.base_price * (quantity - salad.quantity);
                    salad.quantity = quantity;
                    newTotalPrice += priceDiff;
                    updated = true;
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid itemType. Use pizza, drink, side, or salad' });
        }

        if (!updated) {
            return res.status(404).json({ error: 'Item not found at the specified index' });
        }

        cart.total_price = newTotalPrice > 0 ? newTotalPrice : 0;
        await cart.save();

        res.json({ message: 'Quantity updated successfully', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemType, itemIndex } = req.body;

        if (!itemType || itemIndex === undefined) {
            return res.status(400).json({ error: 'itemType and itemIndex are required' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        let deleted = false;
        let priceReduction = 0;

        switch (itemType.toLowerCase()) {
            case 'pizza':
                if (itemIndex >= 0 && itemIndex < cart.pizzas.length) {
                    const pizza = cart.pizzas[itemIndex];
                    let basePrice = 0;
                    if (pizza.pizzaId) {
                        const existingPizza = await Pizza.findById(pizza.pizzaId);
                        basePrice = existingPizza.base_price;
                    } else if (pizza.customPizza) {
                        const toppingDocs = await Topping.find({ _id: { $in: pizza.customPizza.toppings || [] } });
                        const toppingBasePrice = toppingDocs.reduce((sum, topping) => sum + (topping.base_price || 0), 0);
                        basePrice = pizza.customPizza.base_price + toppingBasePrice;
                    }
                    priceReduction = basePrice * pizza.quantity;
                    cart.pizzas.splice(itemIndex, 1);
                    deleted = true;
                }
                break;
            case 'drink':
                if (itemIndex >= 0 && itemIndex < cart.drinks.length) {
                    const drink = cart.drinks[itemIndex];
                    const drinkDoc = await Drink.findById(drink.drinkId);
                    priceReduction = drinkDoc.base_price * drink.quantity;
                    cart.drinks.splice(itemIndex, 1);
                    deleted = true;
                }
                break;
            case 'side':
                if (itemIndex >= 0 && itemIndex < cart.sides.length) {
                    const side = cart.sides[itemIndex];
                    const sideDoc = await Side.findById(side.sideId);
                    priceReduction = sideDoc.base_price * side.quantity;
                    cart.sides.splice(itemIndex, 1);
                    deleted = true;
                }
                break;
            case 'salad':
                if (itemIndex >= 0 && itemIndex < cart.salads.length) {
                    const salad = cart.salads[itemIndex];
                    const saladDoc = await Salad.findById(salad.saladId);
                    priceReduction = saladDoc.base_price * salad.quantity;
                    cart.salads.splice(itemIndex, 1);
                    deleted = true;
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid itemType. Use pizza, drink, side, or salad' });
        }

        if (!deleted) {
            return res.status(404).json({ error: 'Item not found at the specified index' });
        }

        cart.total_price = Math.max(cart.total_price - priceReduction, 0);
        await cart.save();

        res.json({ message: 'Item deleted successfully', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};