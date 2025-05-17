const Pizza = require('../models/pizza');
const { uploadToBlob } = require('../utils/azureBlob');

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
        // Ensure file was uploaded correctly if present
        if (req.file) {
            if (!req.file.buffer) {
                return res.status(400).json({ error: 'File upload failed - no buffer data' });
            }
        }

        const { name, description, size, crust_type, toppings, base_price } = req.body;
        
        if (!name || !description || !size || !crust_type || !base_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let imageUrl = '';
        if (req.file) {
            try {
                const blobName = `${Date.now()}-${req.file.originalname}`;
                imageUrl = await uploadToBlob(req.file.buffer, blobName);
            } catch (uploadError) {
                console.error('Azure upload failed:', uploadError);
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const newPizza = new Pizza({
            name,
            description,
            size,
            crust_type,
            toppings: Array.isArray(toppings) ? toppings : toppings.split(','),
            base_price,
            imageUrl
        });

        const savedPizza = await newPizza.save();
        res.status(201).json(savedPizza);
    } catch (error) {
        console.error('Error creating pizza:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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