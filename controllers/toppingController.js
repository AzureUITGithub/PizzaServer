const Topping = require('../models/topping');

exports.getAllToppings = async (req, res) => {
    try {
        console.log("Đang truy vấn toppings...");
        const toppings = await Topping.find();
        console.log("Toppings:", toppings);
        res.json(toppings);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ error: error.message });
    }
};
