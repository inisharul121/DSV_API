const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'limber-cargo-admin-secret-2026';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Admin authentication required.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminId = decoded.id;
        req.adminRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired admin session.' });
    }
};
