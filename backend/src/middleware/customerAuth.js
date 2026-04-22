const jwt = require('jsonwebtoken');
const { logAuth } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || process.env.JWT_SECRET || 'limber-cargo-customer-secret-2026';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // DIAGNOSTIC LOGGING
    logAuth(`[Customer] URL: ${req.url} - Header: ${!!authHeader} - Token: ${token ? token.substring(0, 10) + '...' : 'null'}`);

    // Support token in query for direct window.open links (e.g. invoice preview)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        logAuth(`[Customer] 401 - No token provided`);
        return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.customerId = decoded.id;
        req.customerEmail = decoded.email;
        // logAuth(`[Customer] Verification Success for ID: ${decoded.id}`);
        next();
    } catch (err) {
        logAuth(`[Customer] 401 - Verification FAILED: ${err.message}`);
        return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
    }
};
