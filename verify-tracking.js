const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testTracking() {
    const shipmentId = '14620017'; // From user screenshot
    const awbNumber = '40170726203663178132';
    const carrierId = '921541696551';

    const base = 'https://api.dsv.com/xp/tracking/v2';

    const officialEndpoints = [
        `${base}/shipmentDetails/${shipmentId}`,
        `${base}/shipmentEvents/${shipmentId}`,
        `${base}/awbEvents/${awbNumber}`,
        `${base}/carrierTrackingEvents/${carrierId}`,
    ];

    for (const url of officialEndpoints) {
        console.log(`\n--- Testing: ${url} ---`);
        try {
            const response = await dsvClient.get(url);
            console.log(`SUCCESS! Status: ${response.status}`);
            console.log('Response:', JSON.stringify(response.data).substring(0, 500));
        } catch (error) {
            console.log(`FAILED: ${error.response?.status || 'ERROR'}`);
            if (error.response?.data) {
                console.log('Error Data:', JSON.stringify(error.response.data));
            }
        }
    }
}

testTracking();
