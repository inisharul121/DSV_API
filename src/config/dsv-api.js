const axios = require('axios');
const config = require('./env');

const dsvClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'DSV-Subscription-Key': config.dsv.subscriptionKey,
        'DSV-Service-Auth': config.dsv.serviceAuth,
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
    // If we need to refresh tokens or add dynamic headers, do it here
    return request;
});

module.exports = dsvClient;
