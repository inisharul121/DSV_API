const axios = require('axios');
const config = require('./env');

const dsvClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': config.dsv.subscriptionKey,
        'Authorization': `Bearer ${config.dsv.serviceAuth}`, // Note: Auth scheme might need checking based on docs
    }
});

// Request interceptor for dynamic auth or logging if needed
dsvClient.interceptors.request.use(request => {
    // If we need to refresh tokens or add dynamic headers, do it here
    return request;
});

module.exports = dsvClient;
