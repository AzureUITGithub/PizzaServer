const Side = require('../models/side');

exports.getAllSides = async (req, res) => {
    try {
        console.log("Đang truy vấn sides...");
        const sides = await Side.find();
        console.log("Sides:", sides);
        res.json(sides);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ error: error.message });
    }
};
