const Salad = require('../models/salad');

exports.getAllSalad = async (req, res) => {
    try {
        const salads = await Salad.find();
        res.json(salads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSaladById = async (req, res) => {
    try {
        const salad = await Salad.findById(req.params.id);
        if (!salad) {
            return res.status(404).json({ error: 'Salad not found' });
        }
        res.json(salad);
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

exports.updateSalad = async (req, res) => {
    try {
        const salad = await Salad.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!salad) {
            return res.status(404).json({ error: 'Salad not found' });
        }
        res.json(salad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSalad = async (req, res) => {
    try {
        const salad = await Salad.findByIdAndDelete(req.params.id);
        if (!salad) {
            return res.status(404).json({ error: 'Salad not found' });
        }
        res.json({ message: 'Salad deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};