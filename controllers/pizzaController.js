const Pizza = require('../models/pizza');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3
aws.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
});

const s3 = new aws.S3();

// Configure Multer to use S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read', // Make the uploaded file publicly accessible
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `pizza-images/${Date.now().toString()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(file.mimetype.toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
    }
}).single('image'); // Expect a single file with field name 'image'

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

exports.createPizza = (req, res) => {
    // Handle file upload with Multer
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const pizzaData = req.body;
            // If an image was uploaded, add the image URL to the pizza data
            if (req.file) {
                pizzaData.image_url = req.file.location; // S3 URL of the uploaded image
            }

            const newPizza = new Pizza(pizzaData);
            const savedPizza = await newPizza.save();
            res.status(201).json(savedPizza);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.updatePizza = (req, res) => {
    // Handle file upload with Multer
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const pizzaData = req.body;
            // If a new image was uploaded, update the image URL
            if (req.file) {
                pizzaData.image_url = req.file.location; // S3 URL of the uploaded image
            }

            const pizza = await Pizza.findByIdAndUpdate(
                req.params.id,
                pizzaData,
                { new: true, runValidators: true }
            );
            if (!pizza) {
                return res.status(404).json({ error: 'Pizza not found' });
            }
            res.json(pizza);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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