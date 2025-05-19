const Salad = require('../models/salad');
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
            const fileName = `salad-images/${Date.now().toString()}-${file.originalname}`;
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

exports.createSalad = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const saladData = req.body;
            if (req.file) {
                saladData.image_url = req.file.location;
            }

            const newSalad = new Salad(saladData);
            const savedSalad = await newSalad.save();
            res.status(201).json(savedSalad);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.updateSalad = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const saladData = req.body;
            if (req.file) {
                saladData.image_url = req.file.location;
            }

            const salad = await Salad.findByIdAndUpdate(
                req.params.id,
                saladData,
                { new: true, runValidators: true }
            );
            if (!salad) {
                return res.status(404).json({ error: 'Salad not found' });
            }
            res.json(salad);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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