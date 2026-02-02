const axios = require('axios');
const config = require('./env');

const dsvClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        // Sending BOTH standard and DSV-specific headers to ensure Gateway accepts it
        'DSV-Subscription-Key': config.dsv.subscriptionKey,
        'Ocp-Apim-Subscription-Key': config.dsv.subscriptionKey,
        'DSV-Service-Auth': config.dsv.serviceAuth,
        'x-pat': config.dsv.pat
    }
});

// Debug log to check if keys are actually loaded (don't log full keys for security)
console.log('DSV Configuration Loaded:');
console.log('- Subscription Key Present:', !!config.dsv.subscriptionKey);
console.log('- Service Auth Present:', !!config.dsv.serviceAuth);
console.log('- PAT Present:', !!config.dsv.pat);
console.log('- Booking Endpoint:', config.dsv.endpoints.booking);

// Request interceptor for dynamic auth or logging if needed
dsvClient.interceptors.request.use(request => {
    // If we need to refresh tokens or add dynamic headers, do it here
    return request;
});

module.exports = dsvClient;
