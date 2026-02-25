const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');
const payloadBuilder = require('./src/utils/payloadBuilder');

async function testQuote() {
    console.log('--- Testing DSV Quote API (Comparator v2) ---');

    const requestData = {
        pickupCountryCode: "CH",
        deliveryCountryCode: "DE",
        weight: 2.5,
        packageType: "PARCELS"
    };

    const payload = payloadBuilder.buildQuotePayload(requestData);
    // payload.dsvAccount = 8004990000;
    payload.shipper = { accountNumber: "8004990000" };
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await dsvClient.post(config.dsv.endpoints.quote, payload);
        console.log('SUCCESS!');
        console.log('Services found:', response.data.services?.length || 0);
    } catch (error) {
        console.error('FAILED!');
        console.error('Status:', error.response?.status || 'ERROR');
        console.error('Error Body:', JSON.stringify(error.response?.data || error.message, null, 2));
    }
}

testQuote();
