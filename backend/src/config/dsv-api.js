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
    const url = request.url;
    const isQuote = url.includes('/comparator') || url.includes('/compare');
    const isTracking = url.includes('/tracking') || url.includes('/awbs') || url.includes('/carriers') || url.includes('Events') || url.includes('Details');
    const isLabel = url.includes('/labels');

    // Helper to clean all auth variations before setting correct ones
    const cleanAuth = () => {
        delete request.headers['dsv-subscription-key'];
        delete request.headers['DSV-Subscription-Key'];
        delete request.headers['dsv-service-auth'];
        delete request.headers['DSV-Service-Auth'];
        delete request.headers['x-pat'];
        delete request.headers['X-PAT'];
    };

    if (isQuote) {
        cleanAuth();
        // Fallback to main sub key if quote specific one is missing 
        request.headers['DSV-Subscription-Key'] = config.dsv.quotePrimaryKey || config.dsv.subscriptionKey;
        request.headers['dsv-service-auth'] = config.dsv.quoteServiceAuth || config.dsv.serviceAuth;
        request.headers['x-pat'] = config.dsv.quotePat || config.dsv.pat;
        console.log(`[DSV API] Using Quote Auth for: ${url}`);
        console.log(`  Header DSV-Subscription-Key: ${mask(request.headers['DSV-Subscription-Key'])}`);
        console.log(`  Header dsv-service-auth:     ${mask(request.headers['dsv-service-auth'])}`);
        console.log(`  Header x-pat:                ${mask(request.headers['x-pat'])}`);
    } else if (isTracking && !isLabel) {
        cleanAuth();
        request.headers['DSV-Subscription-Key'] = config.dsv.trackingSubscriptionKey;
        request.headers['dsv-service-auth'] = config.dsv.trackingServiceAuth;
        request.headers['x-pat'] = config.dsv.pat;
        console.log(`[DSV API] Using Tracking Auth for: ${url}`);
        console.log(`  Header DSV-Subscription-Key: ${mask(request.headers['DSV-Subscription-Key'])}`);
        console.log(`  Header dsv-service-auth:     ${mask(request.headers['dsv-service-auth'])}`);
        console.log(`  Header x-pat:                ${mask(request.headers['x-pat'])}`);
    } else {
        // Booking & Labels (GET or POST)
        cleanAuth();
        request.headers['DSV-Subscription-Key'] = config.dsv.subscriptionKey;
        request.headers['dsv-service-auth'] = config.dsv.serviceAuth;
        request.headers['x-pat'] = config.dsv.pat;
        console.log(`[DSV API] Using Booking/Label Auth for: ${url}`);
        console.log(`  Header DSV-Subscription-Key: ${mask(request.headers['DSV-Subscription-Key'])}`);
        console.log(`  Header dsv-service-auth:     ${mask(request.headers['dsv-service-auth'])}`);
        console.log(`  Header x-pat:                ${mask(request.headers['x-pat'])}`);
    }

    // Add Certification Header if enabled
    if (config.certification.enabled && config.certification.testId) {
        request.headers['x-cert-id'] = config.certification.testId;
        console.log(`[CERTIFICATION] Attached x-cert-id: ${config.certification.testId}`);
    }

    return request;
});

module.exports = dsvClient;
