const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    dsv: {
        subscriptionKey: process.env.DSV_SUBSCRIPTION_KEY,
        trackingSubscriptionKey: process.env.DSV_TRACKING_PRIMARY_KEY,
        serviceAuth: process.env.DSV_SERVICE_AUTH,
        pat: process.env.DSV_PAT,
        account: parseInt(process.env.DSV_ACCOUNT || "8004990000", 10),
        endpoints: {
            booking: process.env.DSV_BOOKING_API || "https://api-test.dsv.com/xpress/booking",
            rate: process.env.DSV_RATE_API || "https://api-test.dsv.com/xpress/rate",
            tracking: process.env.DSV_TRACKING_API || "https://api-test.dsv.com/xpress/tracking",
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
