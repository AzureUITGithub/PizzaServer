const Pizza = require('../models/pizza');

exports.getAllPizzas = async (req, res) => {
    try {
        const pizzas = await Pizza.find();
        res.json(pizzas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPizza = async (req, res) => {
    try {
        const newPizza = new Pizza(req.body);
        const savedPizza = await newPizza.save();
        res.status(201).json(savedPizza);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};