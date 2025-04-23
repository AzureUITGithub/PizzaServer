const Pizza = require('../models/pizza');

exports.getAllPizzas = async (req, res) => {
    try {
        console.log("Đang truy vấn pizzas...");
        const pizzas = await Pizza.find();
        console.log("Pizzas:", pizzas);
        res.json(pizzas);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ error: error.message });
    }
};