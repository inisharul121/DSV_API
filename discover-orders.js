const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function discoverV1() {
    console.log('--- Discovering DSV Order Endpoints v1 ---');
    const account = '8004990000';

    const tests = [
        { base: 'https://api.dsv.com/xp/tracking/v1', path: '/shipments' },
        { base: 'https://api.dsv.com/xp/v1', path: '/shipments' },
    ];

    for (const test of tests) {
        const url = `${test.base}${test.path}`;
        console.log(`\nTesting: ${url}`);
        try {
            const response = await dsvClient.get(url, {
                params: {
                    dsvAccount: account
                }
            });
            console.log(`✅ SUCCESS [${url}]:`, response.status);
            console.log('Keys:', Object.keys(response.data));
        } catch (error) {
            console.log(`❌ FAILED [${url}]:`, error.response?.status || error.message);
        }
    }
}

discoverV1();
