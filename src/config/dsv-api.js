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

// Request interceptor for dynamic auth or logging if needed
dsvClient.interceptors.request.use(request => {
    // If we need to refresh tokens or add dynamic headers, do it here
    return request;
});

module.exports = dsvClient;
