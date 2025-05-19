const Drink = require('../models/drink');
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
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `drink-images/${Date.now().toString()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(file.mimetype.toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
    }
}).single('image');

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

exports.createDrink = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const drinkData = req.body;
            if (req.file) {
                drinkData.image_url = req.file.location;
            }

            const newDrink = new Drink(drinkData);
            const savedDrink = await newDrink.save();
            res.status(201).json(savedDrink);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.updateDrink = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const drinkData = req.body;
            if (req.file) {
                drinkData.image_url = req.file.location;
            }

            const drink = await Drink.findByIdAndUpdate(
                req.params.id,
                drinkData,
                { new: true, runValidators: true }
            );
            if (!drink) {
                return res.status(404).json({ error: 'Drink not found' });
            }
            res.json(drink);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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