const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    dsv: {
        subscriptionKey: process.env.DSV_SUBSCRIPTION_KEY,
        serviceAuth: process.env.DSV_SERVICE_AUTH,
        pat: process.env.DSV_PAT,
        endpoints: {
            booking: "https://api-test.dsv.com/xpress", // Removed /booking path as we append it in controller
            rate: process.env.DSV_RATE_API,
            tracking: "https://api-test.dsv.com/xpress",
        },
    },
    certification: {
        enabled: process.env.CERTIFICATION_MODE === 'true',
        testId: process.env.CERTIFICATION_TEST_ID,
    },
    paths: {
        labels: path.resolve(process.env.LABEL_STORAGE_PATH || './public/labels'),
    },
    upload: {
        maxSize: process.env.MAX_UPLOAD_SIZE || '10mb',
    }
};
