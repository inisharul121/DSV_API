const config = require('../config/env');

exports.buildBookingPayload = (data) => {
    // Current date for timing
    const now = new Date();
    const collectFrom = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    const collectTo = new Date(now.getTime() + (6 * 60 * 60 * 1000));   // 6 hours from now

    const formatDSVDate = (date) => date.toISOString().split('.')[0] + 'Z';

    return {
        dsvAccount: config.dsv.account, // Mandatory: integer
        pickup: {
            requestPickup: true,
            collectDateFrom: formatDSVDate(collectFrom),
            collectDateTo: formatDSVDate(collectTo),
            pickupInstructions: "Ready at front desk",
            address: {
                companyName: "BCIC Swiss GmbH",
                addressLine1: "Lättichstrasse 6",
                city: "Baar",
                countryCode: data.origin?.country || "CH",
                zipCode: "6340",
                contactName: "Eric Aubry",
                contactPhoneNumber: "+41 786195928"
            }
        },
        delivery: {
            companyName: data.destination?.company || "Test Receiver GmbH",
            addressLine1: data.destination?.address || "Main Street 1",
            city: data.destination?.city || "Krefeld",
            countryCode: data.destination?.country || "DE",
            zipCode: data.destination?.zip || "47807",
            contactName: "Receiver",
            contactPhoneNumber: "+44 12345678",
            residential: false
        },
        paymentInformation: {
            shippingChargesPayment: {
                paymentType: "SENDER"
            },
            dutiesAndTaxesPayment: {
                paymentType: "RECEIVER"
            }
        },
        serviceOptions: {
            packageType: "PARCELS",
            serviceCode: "DSVAirExpress"
        },
        dimensionUnit: "CM",
        weightUnit: "KG",
        packages: [
            {
                length: 10,
                width: 10,
                height: 10,
                grossWeight: parseFloat(data.parcels?.[0]?.weight || 2.5)
            }
        ],
        commodities: [
            {
                originCountryCode: data.origin?.country || "CH",
                goodsDescription: (data.commodity && data.commodity.length > 5 && data.commodity !== 'Electonic') ? data.commodity : "Industrial Circuit Boards",
                goodsValue: {
                    currencyCode: "CHF",
                    monetaryValue: 100
                }
            }
        ]
    };
};
