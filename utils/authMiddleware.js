const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedToken');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Kiểm tra xem token có trong danh sách đen không
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token has been invalidated. Please log in again.' });
        }

        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;