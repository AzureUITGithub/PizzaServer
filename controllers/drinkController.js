const Drink = require('../models/drink');

exports.getAllDrinks = async (req, res) => {
    try {
        const drinks = await Drink.find();
        res.json(drinks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDrinkById = async (req, res) => {
    try {
        const drink = await Drink.findById(req.params.id);
        if (!drink) {
            return res.status(404).json({ error: 'Drink not found' });
        }
        res.json(drink);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createDrink = async (req, res) => {
    try {
        const newDrink = new Drink(req.body);
        const savedDrink = await newDrink.save();
        res.status(201).json(savedDrink);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateDrink = async (req, res) => {
    try {
        const drink = await Drink.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!drink) {
            return res.status(404).json({ error: 'Drink not found' });
        }
        res.json(drink);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDrink = async (req, res) => {
    try {
        const drink = await Drink.findByIdAndDelete(req.params.id);
        if (!drink) {
            return res.status(404).json({ error: 'Drink not found' });
        }
        res.json({ message: 'Drink deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};