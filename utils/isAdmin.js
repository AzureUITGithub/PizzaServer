const isAdmin = (req, res, next) => {
    try {
        // Giả sử authMiddleware đã thêm user vào req
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }
        next();
    } catch (error) {
        console.error('Error in isAdmin middleware:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = isAdmin;