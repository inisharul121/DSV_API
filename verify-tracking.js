const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testTracking() {
    const shipmentId = '14617935';

    const patterns = [
        `https://api.dsv.com/xp/v1/shipments/${shipmentId}/tracking`,
        `https://api.dsv.com/xp/v1/tracking/shipments/${shipmentId}`,
        `https://api.dsv.com/xp/v1/tracking/shipments/${shipmentId}/events`,
        `https://api.dsv.com/xp/v2/tracking/shipments/${shipmentId}/events`,
        `https://api.dsv.com/xp/v3/tracking/shipments/${shipmentId}/events`,
        `https://api.dsv.com/xp/v3.1/tracking/shipments/${shipmentId}`,
    ];

    for (const url of patterns) {
        console.log(`\n--- Testing URL: ${url} ---`);
        try {
            const response = await dsvClient.get(url);
            console.log(`SUCCESS!`);
            console.log('Response:', JSON.stringify(response.data).substring(0, 500));
            return;
        } catch (error) {
            console.log(`FAILED: ${error.response?.status || 'ERROR'}`);
            if (error.response?.data) {
                console.log('Error Data:', JSON.stringify(error.response.data));
            }
        }
    }
}

testTracking();
