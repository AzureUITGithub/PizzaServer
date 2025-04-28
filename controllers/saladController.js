const Salad = require('../models/salad');

exports.getAllSalads = async (req, res) => {
    try {
        console.log("Đang truy vấn salads...");
        const salads = await Salad.find();
        console.log("Salads:", salads);
        res.json(salads);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ error: error.message });
    }
};
