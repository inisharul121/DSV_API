const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || 'limber-cargo-customer-secret-2026';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // Support token in query for direct window.open links (e.g. invoice preview)
    if (!token && req.query.token) {
        token = req.query.token;
    }

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
