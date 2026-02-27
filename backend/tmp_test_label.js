const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
    subscriptionKey: process.env.DSV_SUBSCRIPTION_KEY,
    serviceAuth: process.env.DSV_SERVICE_AUTH,
    pat: process.env.DSV_PAT,
    endpoint: process.env.DSV_BOOKING_API || "https://api.dsv.com/xp"
};

const shipmentId = "14621277";
const url = `${config.endpoint}/booking/v2/bookings/labels/${shipmentId}?labelFormat=PDF`;

console.log(`Testing URL: ${url}`);

async function test() {
    try {
        const response = await axios.get(url, {
            headers: {
                'dsv-subscription-key': config.subscriptionKey,
                'dsv-service-auth': config.serviceAuth,
                'x-pat': config.pat
            }
        });

        console.log("Response Status:", response.status);
        console.log("Response Keys:", Object.keys(response.data));

        if (response.data.packageLabels) {
            console.log("packageLabels length:", response.data.packageLabels.length);
            if (response.data.packageLabels.length > 0) {
                console.log("Item 0 keys:", Object.keys(response.data.packageLabels[0]));
                console.log("Item 0 labelContent snippet:", response.data.packageLabels[0].labelContent?.substring(0, 50));
            }
        }

        if (response.data.labelResults) {
            console.log("labelResults length:", response.data.labelResults.length);
            if (response.data.labelResults.length > 0) {
                console.log("Item 0 keys:", Object.keys(response.data.labelResults[0]));
                console.log("Item 0 labelContent snippet:", response.data.labelResults[0].labelContent?.substring(0, 50));
            }
        }

    } catch (error) {
        console.error("Error:", error.response?.status, error.response?.data || error.message);
    }
}

test();
