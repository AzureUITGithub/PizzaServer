const Drink = require('../models/drink');

exports.getAllDrinks = async (req, res) => {
    try {
        const drinks = await Drink.find();
        res.json(drinks);
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