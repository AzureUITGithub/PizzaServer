const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
    try {
        console.log("Đang truy vấn users...");
        const users = await User.find();
        console.log("Users:", users);
        res.json(users);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ error: error.message });
    }
};
