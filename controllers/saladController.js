const Salad = require('../models/salad');

exports.getAllSalad = async (req, res) => {
    try {
        const salads = await Salad.find();
        res.json(salads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSalad = async (req, res) => {
    try {
        const newSalad = new Salad(req.body);
        const savedSalad = await newSalad.save();
        res.status(201).json(savedSalad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};