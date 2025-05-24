const Cart = require('../models/cart');
const Delivery = require('../models/delivery');
const User = require('../models/user');

exports.createDelivery = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ userId })
            .populate('pizzas.pizzaId')
            .populate('pizzas.customPizza.toppings')
            .populate('drinks.drinkId')
            .populate('sides.sideId')
            .populate('salads.saladId');

        if (!cart || (cart.pizzas.length === 0 && cart.drinks.length === 0 && cart.sides.length === 0 && cart.salads.length === 0)) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Mock restaurant location (you can replace this with your actual restaurant address)
        const restaurantAddress = encodeURIComponent('Quốc lộ 1K, Đông Hoà, Dĩ An, Bình Dương 820000, Vietnam');
        // User's delivery address
        const deliveryAddress = encodeURIComponent(user.address);

        // Generate Google Maps tracking URL
        const trackingUrl = `https://www.google.com/maps/dir/?api=1&origin=${restaurantAddress}&destination=${deliveryAddress}&travelmode=driving`;

        const delivery = new Delivery({
            userId,
            order: {
                pizzas: cart.pizzas,
                drinks: cart.drinks,
                sides: cart.sides,
                salads: cart.salads,
                total_price: cart.total_price
            },
            address: user.address,
            tracking_url: trackingUrl
        });

        await delivery.save();

        // Clear the cart after creating the delivery
        await Cart.deleteOne({ userId });

        res.status(201).json({ delivery, message: 'Order placed successfully. Track your delivery using the tracking_url.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('order.pizzas.pizzaId')
            .populate('order.pizzas.customPizza.toppings')
            .populate('order.drinks.drinkId')
            .populate('order.sides.sideId')
            .populate('order.salads.saladId');
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }
        res.json(delivery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.confirmDelivery = async (req, res) => {
    try {
        const userId = req.user.userId;
        const deliveryId = req.params.id;

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (delivery.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only confirm your own deliveries' });
        }

        if (delivery.status === 'delivered') {
            return res.status(400).json({ error: 'Delivery has already been confirmed' });
        }

        delivery.status = 'delivered';
        delivery.deliveredAt = new Date(); // Add timestamp for when delivery was confirmed
        await delivery.save();

        res.json({ message: 'Delivery confirmed successfully', delivery });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDeliveredDeliveries = async (req, res) => {
    try {
        const userId = req.user.userId;
        const deliveries = await Delivery.find({ 
            userId, 
            status: 'delivered' 
        })
            .populate('order.pizzas.pizzaId')
            .populate('order.pizzas.customPizza.toppings')
            .populate('order.drinks.drinkId')
            .populate('order.sides.sideId')
            .populate('order.salads.saladId')
            .sort({ deliveredAt: -1 }); // Sort by delivery date, most recent first

        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ message: 'No delivered orders found' });
        }

        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};