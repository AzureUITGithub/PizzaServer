const Topping = require('../models/topping');

exports.getAllToppings = async (req, res) => {
    try {
        const toppings = await Topping.find();
        res.json(toppings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getToppingById = async (req, res) => {
    try {
        const topping = await Topping.findById(req.params.id);
        if (!topping) {
            return res.status(404).json({ error: 'Topping not found' });
        }
        res.json(topping);
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

exports.updateTopping = async (req, res) => {
    try {
        const topping = await Topping.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!topping) {
            return res.status(404).json({ error: 'Topping not found' });
        }
        res.json(topping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTopping = async (req, res) => {
    try {
        const topping = await Topping.findByIdAndDelete(req.params.id);
        if (!topping) {
            return res.status(404).json({ error: 'Topping not found' });
        }
        res.json({ message: 'Topping deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};