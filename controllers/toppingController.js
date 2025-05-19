const Topping = require('../models/topping');
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
            const fileName = `topping-images/${Date.now().toString()}-${file.originalname}`;
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

exports.createTopping = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const toppingData = req.body;
            if (req.file) {
                toppingData.image_url = req.file.location;
            }

            const newTopping = new Topping(toppingData);
            const savedTopping = await newTopping.save();
            res.status(201).json(savedTopping);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.updateTopping = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const toppingData = req.body;
            if (req.file) {
                toppingData.image_url = req.file.location;
            }

            const topping = await Topping.findByIdAndUpdate(
                req.params.id,
                toppingData,
                { new: true, runValidators: true }
            );
            if (!topping) {
                return res.status(404).json({ error: 'Topping not found' });
            }
            res.json(topping);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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