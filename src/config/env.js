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
            booking: "https://api.dsv.com/my-demo",
            rate: "https://api.dsv.com/my-demo",
            tracking: "https://api.dsv.com/my-demo/tracking", // Adjusted based on standard DSV patterns, valid for verification
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
