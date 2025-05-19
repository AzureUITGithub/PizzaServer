const Side = require('../models/side');
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
            const fileName = `side-images/${Date.now().toString()}-${file.originalname}`;
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

exports.createSide = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const sideData = req.body;
            if (req.file) {
                sideData.image_url = req.file.location;
            }

            const newSide = new Side(sideData);
            const savedSide = await newSide.save();
            res.status(201).json(savedSide);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.updateSide = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const sideData = req.body;
            if (req.file) {
                sideData.image_url = req.file.location;
            }

            const side = await Side.findByIdAndUpdate(
                req.params.id,
                sideData,
                { new: true, runValidators: true }
            );
            if (!side) {
                return res.status(404).json({ error: 'Side not found' });
            }
            res.json(side);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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