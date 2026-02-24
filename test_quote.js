require('dotenv').config();
const config = require('./src/config/env');
const dsvClient = require('./src/config/dsv-api');

const testPayload = {
    // Some regions require dsvAccount as string even if docs say int64
    "dsvAccount": 6400000000,
    "pickupCountryCode": "DK",
    "pickupCity": "Copenhagen",
    "deliveryCountryCode": "DE",
    "deliveryCity": "Munchen",
    "serviceOptions": {
        "packageType": "PARCELS",
        "saturdayDelivery": false,
        "insurance": {
            "currencyCode": "DKK",
            "monetaryValue": 2000
        }
    },
    "dimensionUnit": "CM",
    "weightUnit": "KG",
    "residentialDelivery": false,
    "ddp": false,
    "specialContent": "DRY_ICE",
    "packages": [{
        "length": 20,
        "width": 30,
        "height": 30,
        "grossWeight": 6.5
    }],
    "collectDate": "2000-09-25"
};

async function testQuote() {
    console.log("Testing Quote API...");
    try {
        const response = await dsvClient.post(config.dsv.endpoints.quote, testPayload);
        console.log("Success:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("DSV Error Stacks:", error.response?.data || error.message);
        if (error.response?.data?.errors) {
            console.error("Details:", JSON.stringify(error.response.data.errors, null, 2));
        }
    }
}

testQuote();
