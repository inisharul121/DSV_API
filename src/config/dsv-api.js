const axios = require('axios');
const config = require('./env');

const dsvClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'dsv-subscription-key': config.dsv.subscriptionKey,
        'dsv-service-auth': config.dsv.serviceAuth,
        'x-pat': config.dsv.pat
    }
});

// Debug log to check keys (Masked)
// Helper to show first/last 4 chars
const mask = (str) => {
    if (!str) return 'MISSING';
    if (str.length < 8) return str;
    return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
};

console.log('--- DSV Auth Debug ---');
console.log(`Sub Key:      ${mask(config.dsv.subscriptionKey)}`);
console.log(`Service Auth: ${mask(config.dsv.serviceAuth)}`);
console.log(`PAT:          ${mask(config.dsv.pat)}`);
console.log(`Endpoint:     ${config.dsv.endpoints.booking}`);
console.log('----------------------');

// Request interceptor for dynamic auth or logging if needed
dsvClient.interceptors.request.use(request => {
    // Switch subscription key if it's a tracking request
    if (request.url.includes('/tracking') || request.url.includes('/shipments')) {
        request.headers['dsv-subscription-key'] = config.dsv.trackingSubscriptionKey;
    }
    return request;
});

module.exports = dsvClient;
