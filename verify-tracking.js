const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testTracking() {
    const shipmentId = '14620017';
    const account = '6400000000'; // From dashboard screenshot
    const base = 'https://api.dsv.com/xp/tracking/v2';

    const secondaryKey = 'bd08b8c325f843f6919e0f56375970dc';

    const tests = [
        { name: 'Primary Key + shipmentDetails', key: config.dsv.trackingSubscriptionKey, url: `${base}/shipmentDetails/${shipmentId}` },
        { name: 'Secondary Key + shipmentDetails', key: secondaryKey, url: `${base}/shipmentDetails/${shipmentId}` },
        { name: 'Primary Key + shipmentDetails + dsvAccount', key: config.dsv.trackingSubscriptionKey, url: `${base}/shipmentDetails/${shipmentId}?dsvAccount=${account}` },
    ];

    for (const test of tests) {
        console.log(`\n--- Testing: ${test.name} ---`);
        try {
            const response = await dsvClient.get(test.url, {
                headers: { 'DSV-Subscription-Key': test.key }
            });
            console.log(`SUCCESS! Status: ${response.status}`);
            console.log('Response:', JSON.stringify(response.data));
        } catch (error) {
            console.log(`FAILED: ${error.response?.status || 'ERROR'}`);
            if (error.response?.data) {
                console.log('Error Data:', JSON.stringify(error.response.data));
            }
        }
    }
}

testTracking();
