const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testTracking() {
    const shipmentId = '10123456';
    const awbNumber = '40170726203663178132';
    const carrierId = '921541696551';

    const endpoints = [
        `${config.dsv.endpoints.tracking}/shipments/${shipmentId}`,
        `${config.dsv.endpoints.tracking}/shipments/${shipmentId}/events`,
        `${config.dsv.endpoints.tracking}/awbs/${awbNumber}/events`,
        `${config.dsv.endpoints.tracking}/carriers/${carrierId}/events`,
    ];

    for (const url of endpoints) {
        console.log(`\n--- Testing Endpoint: ${url} ---`);
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
