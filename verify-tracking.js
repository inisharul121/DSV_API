const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testTracking() {
    const shipmentId = '14620017';
    const awbNumber = '40170726203663178132';
    const carrierId = '921541696551';
    const base = 'https://api.dsv.com/xp/tracking/v2';

    const finalTests = [
        { name: 'Shipment Details', url: `${base}/shipmentDetails/${shipmentId}` },
        { name: 'Shipment Events (by ID)', url: `${base}/shipments/shipmentId/${shipmentId}` },
        { name: 'Shipment Events (by AWB)', url: `${base}/shipments/awb/${awbNumber}` },
        { name: 'Shipment Events (by Carrier)', url: `${base}/shipments/carrierTrackingNumber/${carrierId}` },
    ];

    for (const test of finalTests) {
        console.log(`\n--- Testing: ${test.name} ---`);
        try {
            const response = await dsvClient.get(test.url);
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
