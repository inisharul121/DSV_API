// src/middleware/certification.js
const config = require('../config/env');

module.exports = (req, res, next) => {
    if (config.certification.enabled) {
        // Add the certification ID to the request object so it can be used in the API client
        // Note: Since we use a shared axios instance, we might need to handle this per-request.
        // However, usually we pass headers at the time of the call. 
        // This middleware is mainly to flag the request context.
        req.certificationId = config.certification.testId;
        console.log(`[CERTIFICATION MODE] Applying Test ID: ${req.certificationId}`);
    }
    next();
};
