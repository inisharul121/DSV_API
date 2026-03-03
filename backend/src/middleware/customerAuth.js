const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || 'limber-cargo-customer-secret-2026';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.customerId = decoded.id;
        req.customerEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
    }
};
