const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
    subscriptionKey: "dd0af9fe90d4427ebaa75fc0cf9157fe", // From .env
    serviceAuth: "dsv-service-auth-value", // I should get real values
    pat: "dsv-pat-value",
    endpoint: "https://api.dsv.com/xp"
};

// I'll grab the actual values from the .env content I saw earlier
const realConfig = {
    subscriptionKey: "dd0af9fe90d4427ebaa75fc0cf9157fe",
    serviceAuth: "45da500.e3ff4475b867f01bcb1f5eee8",
    pat: "xho2zdUOR9bBN8vv/HmkGLv1BxqUoGq5yWcAKehkFExmG8xZ1KGDtNXtc8TL",
    endpoint: "https://api.dsv.com/xp"
};

const shipmentId = "14621319";
const paths = [
    "/v2/bookings/labels",
    "/v2/shipments",
    "/booking/v2/bookings/labels",
    "/booking/v2/shipments",
    "/v1/bookings/labels",
    "/v1/shipments",
    "/bookings/labels",
    "/shipments"
];

const methods = ["GET", "POST"];

async function run() {
    for (const p of paths) {
        let url = "";
        if (p.includes("shipments") && !p.includes("labels")) {
            url = `${realConfig.endpoint}${p}/${shipmentId}/labels?labelFormat=PDF`;
        } else {
            url = `${realConfig.endpoint}${p}/${shipmentId}?labelFormat=PDF`;
        }

        for (const m of methods) {
            try {
                console.log(`[TEST] ${m} ${url}`);
                const options = {
                    headers: {
                        'DSV-Subscription-Key': realConfig.subscriptionKey,
                        'dsv-service-auth': realConfig.serviceAuth,
                        'x-pat': realConfig.pat
                    }
                };

                let response;
                if (m === "GET") {
                    response = await axios.get(url, options);
                } else {
                    response = await axios.post(url, {}, options);
                }

                console.log(`[SUCCESS] ${m} ${url} - Status: ${response.status}`);
                console.log(`[DATA] Keys: ${Object.keys(response.data).join(', ')}`);
                const labelItem = (response.data.labelResults?.[0]) || (response.data.packageLabels?.[0]);
                console.log(`[DATA] Content Keys: ${labelItem ? Object.keys(labelItem).join(', ') : 'NONE'}`);

            } catch (err) {
                console.log(`[FAILED] ${m} ${url} - Status: ${err.response?.status || err.message}`);
            }
        }
    }
}

run();
