const jwt = require('jsonwebtoken');
const { logAuth } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'limber-cargo-admin-secret-2026';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // DIAGNOSTIC LOGGING
    logAuth(`[Admin] URL: ${req.url} - Header: ${!!authHeader} - Token: ${token ? token.substring(0, 10) + '...' : 'null'}`);

    // Support token in query for previews
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        logAuth(`[Admin] 401 - No token provided`);
        return res.status(401).json({ success: false, error: 'Admin authentication required.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminId = decoded.id;
        req.adminRole = decoded.role;
        // logAuth(`[Admin] Verification Success for ID: ${decoded.id}`);
        next();
    } catch (err) {
        logAuth(`[Admin] 401 - Verification FAILED: ${err.message}`);
        return res.status(401).json({ success: false, error: 'Invalid or expired admin session.' });
    }
};
