const config = require('../config/env');

exports.buildBookingPayload = (data) => {
    // Current date for timing
    const now = new Date();
    const collectFrom = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    const collectTo = new Date(now.getTime() + (6 * 60 * 60 * 1000));   // 6 hours from now

    const formatDSVDate = (date) => date.toISOString().split('.')[0] + 'Z';

    // Base structure with defaults
    const payload = {
        dsvAccount: parseInt(data.dsvAccount || config.dsv.account),
        pickup: {
            requestPickup: data.pickup?.requestPickup !== undefined ? data.pickup.requestPickup : true,
            collectDateFrom: data.pickup?.collectDateFrom || formatDSVDate(collectFrom),
            collectDateTo: data.pickup?.collectDateTo || formatDSVDate(collectTo),
            pickupInstructions: data.pickup?.pickupInstructions || "Ready at front desk",
            address: {
                companyName: data.pickup?.address?.companyName || "BCIC Swiss GmbH",
                addressLine1: data.pickup?.address?.addressLine1 || "Lättichstrasse 6",
                city: data.pickup?.address?.city || "Baar",
                countryCode: data.pickup?.address?.countryCode || data.origin_country || "CH",
                zipCode: data.pickup?.address?.zipCode || "6340",
                contactName: data.pickup?.address?.contactName || "Eric Aubry",
                contactPhoneNumber: data.pickup?.address?.contactPhoneNumber || "+41 786195928"
            }
        },
        delivery: {
            companyName: data.delivery?.companyName || data.dest_company || "Test Receiver GmbH",
            addressLine1: data.delivery?.addressLine1 || data.dest_address || "Main Street 1",
            city: data.delivery?.city || data.dest_city || "Krefeld",
            countryCode: data.delivery?.countryCode || data.dest_country || "DE",
            zipCode: data.delivery?.zipCode || data.dest_zip || "47807",
            contactName: data.delivery?.contactName || "Receiver",
            contactPhoneNumber: data.delivery?.contactPhoneNumber || "+44 12345678",
            residential: data.delivery?.residential !== undefined ? data.delivery.residential : false
        },
        paymentInformation: {
            shippingChargesPayment: {
                paymentType: data.paymentInformation?.shippingChargesPayment?.paymentType || "SENDER"
            },
            dutiesAndTaxesPayment: {
                paymentType: data.paymentInformation?.dutiesAndTaxesPayment?.paymentType || "RECEIVER"
            }
        },
        serviceOptions: {
            packageType: data.serviceOptions?.packageType || "PARCELS",
            serviceCode: data.serviceOptions?.serviceCode || data.serviceCode || "DSVAirExpress"
        },
        dimensionUnit: data.dimensionUnit || "CM",
        weightUnit: data.weightUnit || "KG",
        packages: data.packages || [
            {
                length: parseFloat(data.length || 10),
                width: parseFloat(data.width || 10),
                height: parseFloat(data.height || 10),
                grossWeight: parseFloat(data.weight || 2.5)
            }
        ],
        commodities: data.commodities || [
            {
                originCountryCode: data.pickup?.address?.countryCode || data.origin_country || "CH",
                goodsDescription: data.commodity || "Industrial Circuit Boards",
                goodsValue: {
                    currencyCode: data.currencyCode || "CHF",
                    monetaryValue: parseFloat(data.goodsValue || 100)
                }
            }
        ]
    };

    return payload;
};

exports.buildQuotePayload = (data) => {
    // Collect Date defaults to today if not provided, format yyyy-MM-dd
    const now = new Date();
    const collectDateStr = data.collectDate || now.toISOString().split('T')[0];

    return {
        dsvAccount: parseInt(data.dsvAccount || config.dsv.account),
        pickupCountryCode: data.pickupCountryCode || "DK",
        pickupCity: data.pickupCity || undefined,
        pickupZipCode: data.pickupZipCode || undefined,
        deliveryCountryCode: data.deliveryCountryCode || "DE",
        deliveryCity: data.deliveryCity || undefined,
        deliveryZipCode: data.deliveryZipCode || undefined,
        residentialDelivery: data.residentialDelivery === true || data.residentialDelivery === 'true',
        serviceOptions: {
            packageType: data.packageType || "PARCELS", // PARCELS / DOCUMENT / ENVELOPE
            saturdayDelivery: data.saturdayDelivery === true || data.saturdayDelivery === 'true',
            timeOption: data.timeOption || undefined,
            insurance: data.insuranceCurrency ? {
                currencyCode: data.insuranceCurrency,
                monetaryValue: parseFloat(data.insuranceValue)
            } : undefined
        },
        ddp: data.ddp === true || data.ddp === 'true',
        specialContent: data.specialContent || null,
        dimensionUnit: data.dimensionUnit || "CM",
        weightUnit: data.weightUnit || "KG",
        packages: data.packages && data.packages.length > 0 ? data.packages.map(p => ({
            length: p.length ? parseFloat(p.length) : undefined,
            width: p.width ? parseFloat(p.width) : undefined,
            height: p.height ? parseFloat(p.height) : undefined,
            grossWeight: parseFloat(p.grossWeight || p.weight || 1.0)
        })) : [{
            length: parseFloat(data.defaultLength || 10),
            width: parseFloat(data.defaultWidth || 10),
            height: parseFloat(data.defaultHeight || 10),
            grossWeight: parseFloat(data.defaultWeight || 1.0)
        }],
        collectDate: collectDateStr
    };
};
