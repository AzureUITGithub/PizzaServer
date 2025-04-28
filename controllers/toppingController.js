const Topping = require('../models/topping');

exports.getAllToppings = async (req, res) => {
    try {
        const toppings = await Topping.find();
        res.json(toppings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTopping = async (req, res) => {
    try {
        const newTopping = new Topping(req.body);
        const savedTopping = await newTopping.save();
        res.status(201).json(savedTopping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};