const Side = require('../models/side');

exports.getAllSides = async (req, res) => {
    try {
        const sides = await Side.find();
        res.json(sides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSideById = async (req, res) => {
    try {
        const side = await Side.findById(req.params.id);
        if (!side) {
            return res.status(404).json({ error: 'Side not found' });
        }
        res.json(side);
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

exports.updateSide = async (req, res) => {
    try {
        const side = await Side.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!side) {
            return res.status(404).json({ error: 'Side not found' });
        }
        res.json(side);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSide = async (req, res) => {
    try {
        const side = await Side.findByIdAndDelete(req.params.id);
        if (!side) {
            return res.status(404).json({ error: 'Side not found' });
        }
        res.json({ message: 'Side deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};