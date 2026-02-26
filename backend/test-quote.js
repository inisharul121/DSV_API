const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');
const payloadBuilder = require('./src/utils/payloadBuilder');

async function testQuote() {
    console.log('--- Final DSV Quote API Verification ---');

    // Exact data format expected from UI
    const requestData = {
        pickupCountryCode: "CH",
        deliveryCountryCode: "DE",
        weight: 2.5,
        packageType: "PARCELS",
        collectDate: new Date().toISOString().split('T')[0]
    };

    const payload = payloadBuilder.buildQuotePayload(requestData);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await dsvClient.post(config.dsv.endpoints.quote, payload);
        console.log('SUCCESS!');
        console.log('Services:', response.data.services?.length || 0);
    } catch (error) {
        console.error('FAILED (Expected if organization is not mapped)');
        console.error('Status:', error.response?.status || 'ERROR');
        console.error('Error Body:', JSON.stringify(error.response?.data || error.message, null, 2));
    }
}

testQuote();
