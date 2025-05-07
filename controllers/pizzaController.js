const Pizza = require('../models/pizza');

exports.getAllPizzas = async (req, res) => {
    try {
        const pizzas = await Pizza.find();
        res.json(pizzas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPizzaById = async (req, res) => {
    try {
        const pizza = await Pizza.findById(req.params.id);
        if (!pizza) {
            return res.status(404).json({ error: 'Pizza not found' });
        }
        res.json(pizza);
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

exports.updatePizza = async (req, res) => {
    try {
        const pizza = await Pizza.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!pizza) {
            return res.status(404).json({ error: 'Pizza not found' });
        }
        res.json(pizza);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePizza = async (req, res) => {
    try {
        const pizza = await Pizza.findByIdAndDelete(req.params.id);
        if (!pizza) {
            return res.status(404).json({ error: 'Pizza not found' });
        }
        res.json({ message: 'Pizza deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};