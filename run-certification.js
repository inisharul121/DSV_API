const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_BASE = `http://localhost:${process.env.PORT || 3001}/api`;

async function runTC1() {
    console.log('\n--- Running TC1: Simple Booking Certification ---');
    try {
        const payload = {
            dsvAccount: process.env.DSV_ACCOUNT || '8004990000',
            pickup: {
                collectDateFrom: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:00:00',
                companyName: "BCIC Swiss GmbH",
                addressLine1: "Lättichstrasse 6",
                zipCode: "6340",
                city: "Baar",
                countryCode: "CH",
                contactName: "Eric Aubry",
                contactPhoneNumber: "+41786195928"
            },
            delivery: {
                companyName: "Test Receiver GmbH",
                addressLine1: "Main Street 1",
                zipCode: "47807",
                city: "Krefeld",
                countryCode: "DE",
                contactName: "Receiver",
                contactPhoneNumber: "+4912345678"
            },
            serviceOptions: {
                packageType: "PARCELS",
                serviceCode: "DSVAirExpress"
            },
            packages: [
                {
                    length: 10,
                    width: 10,
                    height: 10,
                    grossWeight: 2.5
                }
            ]
        };

        console.log('Sending TC1 request...');
        const response = await axios.post(`${API_BASE}/bookings/simple`, { shipmentData: payload });

        console.log('✅ TC1 RESPONSE SUCCESS!');
        console.log('Shipment ID:', response.data.shipmentId || 'N/A');
        console.log('Status:', response.data.status || 'N/A');

        return true;
    } catch (error) {
        console.error('❌ TC1 FAILED:', error.response?.data || error.message);
        return false;
    }
}

async function main() {
    const testId = process.argv[2] || 'TC1';

    // Ensure .env is set to certification mode
    if (process.env.CERTIFICATION_MODE !== 'true') {
        console.warn('⚠️  Warning: CERTIFICATION_MODE is not true in .env');
    }

    switch (testId.toUpperCase()) {
        case 'TC1':
            await runTC1();
            break;
        default:
            console.log(`Unknown test ID: ${testId}`);
    }
}

main();
