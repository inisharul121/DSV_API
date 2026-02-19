const dsvClient = require('./src/config/dsv-api');
const config = require('./src/config/env');

async function testBooking() {
    const account = 8004990000;
    const services = ["DSVAirExpress", "DSVParcels"];

    for (const svc of services) {
        console.log(`\n--- Testing Account: ${account}, Service: ${svc} ---`);
        const payload = {
            dsvAccount: account,
            pickup: {
                collectDateFrom: new Date(Date.now() + 7200000).toISOString().split('.')[0] + 'Z',
                collectDateTo: new Date(Date.now() + 14400000).toISOString().split('.')[0] + 'Z',
                pickupInstructions: "Handle with care",
                address: {
                    companyName: "BCIC Swiss GmbH",
                    addressLine1: "Lättichstrasse 6",
                    zipCode: "6340",
                    city: "Baar",
                    countryCode: "CH",
                    contactName: "Eric Aubry",
                    contactPhoneNumber: "+41 786195928",
                    contactEmail: "eric.aubry@fr.dsv.com"
                }
            },
            delivery: {
                companyName: "DSV Air & Sea GmbH",
                addressLine1: "Nirostastraße 3",
                zipCode: "47807",
                city: "Krefeld",
                countryCode: "DE",
                contactName: "Receiver contact",
                contactPhoneNumber: "+44 123456789",
                contactEmail: "contact.email@receiver.com",
                residential: true
            },
            paymentInformation: {
                shippingChargesPayment: { paymentType: "SENDER" },
                dutiesAndTaxesPayment: { paymentType: "RECEIVER" }
            },
            serviceOptions: {
                packageType: "PARCELS",
                serviceCode: svc
            },
            dimensionUnit: "CM",
            weightUnit: "KG",
            packages: [{
                length: 50,
                width: 40,
                height: 40,
                grossWeight: 6.5
            }],
            commodities: [{
                originCountryCode: "CH",
                goodsDescription: "Industrial Circuit Boards",
                goodsValue: {
                    currencyCode: "CHF",
                    monetaryValue: 100
                }
            }]
        };

        const url = `${config.dsv.endpoints.booking}/booking/v2/bookings`;
        try {
            const response = await dsvClient.post(url, payload);
            console.log(`SUCCESS for ${svc}!`);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return;
        } catch (error) {
            console.log(`FAILED for ${svc}`);
            console.log('Status:', error.response?.status || 'ERROR');
            console.log('Error Message:', error.response?.data?.errors?.[0]?.message || 'No specific error message');
        }
    }
}

testBooking();
