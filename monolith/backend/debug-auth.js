const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const config = {
    primarySubKey: "dd0af9fe90d4427ebaa75fc0cf9157fe",
    secondarySubKey: "9719fcecc4c44f79aab777252cf54833",
    primaryServiceAuth: "45da500.e3ff4475b867f01bcb1f5eee8",
    secondaryServiceAuth: "b4abf8e.022b140d5a88555abc337adf3",
    pats: [
        "xho2zdUOR9bBN8vv/HmkGLv1BxqUoGq5yWCaKehkFExmG8xZ1KGDtNXtc8TL", // From screenshot (WCa)
        "xho2zdUOR9bBN8vv/HmkGLv1BxqUoGq5yWcAKehkFExmG8xZ1KGDtNXtc8TL"  // From user text (WcA)
    ],
    url: "https://api.dsv.com/xp/booking/v2/bookings"
};

async function testAuth(url, headers) {
    console.log(`\nTesting URL: ${url}`);
    console.log(`Headers: ${JSON.stringify(Object.keys(headers))}`);
    try {
        const response = await axios.post(url, {}, { headers, timeout: 5000 });
        console.log(`Response Status: ${response.status}`);
    } catch (error) {
        console.log(`Status: ${error.response?.status || 'ERROR'}`);
        console.log(`Message: ${JSON.stringify(error.response?.data || error.message)}`);
    }
}

async function runTests() {
    for (const pat of config.pats) {
        console.log(`\n--- Testing PAT: ...${pat.substring(30, 40)}... ---`);

        // Test with Primary Key
        await testAuth(config.url, {
            'dsv-service-auth': config.primaryServiceAuth,
            'x-pat': pat,
            'dsv-subscription-key': config.primarySubKey,
            'Content-Type': 'application/json'
        });

        // Test with Secondary Service Auth
        await testAuth(config.url, {
            'dsv-service-auth': config.secondaryServiceAuth,
            'x-pat': pat,
            'dsv-subscription-key': config.primarySubKey,
            'Content-Type': 'application/json'
        });
    }
}

runTests();
