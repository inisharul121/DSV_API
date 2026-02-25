const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testSpecificOrder() {
    const shipmentId = '14620184';
    const url = `${config.dsv.endpoints.tracking}/shipmentDetails/${shipmentId}`;
    console.log(`Testing Specific Order: ${url}`);
    try {
        const response = await dsvClient.get(url);
        console.log('✅ SUCCESS:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ FAILED:', error.response?.status || error.message);
        if (error.response?.data) {
            console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSpecificOrder();
