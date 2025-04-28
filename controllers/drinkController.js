const Drink = require('../models/drink');

exports.getAllDrinks = async (req, res) => {
    try {
        console.log("Đang truy vấn drinks...");
        const drinks = await Drink.find();
        console.log("Drinks:", drinks);
        res.json(drinks);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ error: error.message });
    }
};
