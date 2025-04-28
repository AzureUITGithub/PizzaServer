const Side = require('../models/side');

exports.getAllSides = async (req, res) => {
    try {
        const sides = await Side.find();
        res.json(sides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSide = async (req, res) => {
    try {
        const newSide = new Side(req.body);
        const savedSide = await newSide.save();
        res.status(201).json(savedSide);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};