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
        trackingServiceAuth: process.env.DSV_TRACKING_SERVICE_AUTH,
        pat: process.env.DSV_PAT,
        quotePrimaryKey: process.env.DSV_QUOTE_PRIMARY_KEY,
        quoteSecondaryKey: process.env.DSV_QUOTE_SECONDARY_KEY,
        quoteServiceAuth: process.env.DSV_QUOTE_SERVICE_AUTH,
        quotePat: process.env.DSV_QUOTE_PAT,
        account: parseInt(process.env.DSV_ACCOUNT || "8004990000", 10),
        endpoints: {
            booking: process.env.DSV_BOOKING_API || "https://api-test.dsv.com/xpress/booking",
            rate: process.env.DSV_RATE_API || "https://api-test.dsv.com/xpress/rate",
            tracking: process.env.DSV_TRACKING_API || "https://api-test.dsv.com/xpress/tracking",
            quote: process.env.DSV_QUOTE_API || "https://api.dsv.com/xp/comparator/v2/compare",
        },
    },
    certification: {
        enabled: process.env.CERTIFICATION_MODE === 'true' || false,
        testId: process.env.CERTIFICATION_TEST_ID || '',
    },
    paths: {
        labels: path.resolve(process.env.LABEL_STORAGE_PATH || './public/labels'),
    },
    upload: {
        maxSize: process.env.MAX_UPLOAD_SIZE || '10mb',
    },
    database: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dsv_shipping_db',
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
};
