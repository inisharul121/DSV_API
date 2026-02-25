const config = require('../config/env');

/**
 * Ensures phone number matches DSV regex: ^[+]?[0-9]{1,4} [0-9]{1}[0-9 ]{1,}
 * Requires a space after the country code.
 */
const formatPhoneNumber = (num) => {
    if (!num) return num;
    num = num.trim();

    // If it already matches or has a space, return as is
    if (num.includes(' ') || /^[+]?[0-9]{1,4} [0-9]/.test(num)) {
        return num;
    }

    // Heuristic: If starts with + followed by digits, insert space after first 3 chars (+XX) 
    // or first 4 chars (+XXX) if we want to be safe. 
    // Most common: +4178... -> +41 78...
    if (num.startsWith('+')) {
        if (num.length > 5) {
            // Check if it's +41... (Swiss)
            if (num.startsWith('+41')) return '+41 ' + num.substring(3);
            if (num.startsWith('+49')) return '+49 ' + num.substring(3);
            if (num.startsWith('+45')) return '+45 ' + num.substring(3);
            if (num.startsWith('+44')) return '+44 ' + num.substring(3);
            if (num.startsWith('+1')) return '+1 ' + num.substring(2);

            // Generic fallback: space after the + and first two digits
            return num.substring(0, 3) + ' ' + num.substring(3);
        }
    }

    // If no +, just return it (might still fail, but we'll add UI hints)
    return num;
};

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
            pickupInstructions: data.pickup?.pickupInstructions || data.pickupInstructions || "Ready at front desk",
            address: {
                companyName: data.origin_company || data.pickup?.address?.companyName || "Sender",
                addressLine1: data.origin_address || data.pickup?.address?.addressLine1 || "",
                city: data.origin_city || data.pickup?.address?.city || "",
                countryCode: data.origin_country || data.pickup?.address?.countryCode || "CH",
                zipCode: data.origin_zip || data.pickup?.address?.zipCode || "",
                contactName: data.origin_contact || data.pickup?.address?.contactName || "",
                contactPhoneNumber: formatPhoneNumber(data.origin_phone || data.pickup?.address?.contactPhoneNumber || "")
            }
        },
        delivery: {
            companyName: data.dest_company || data.delivery?.companyName || "Receiver",
            addressLine1: data.dest_address || data.delivery?.addressLine1 || "",
            city: data.dest_city || data.delivery?.city || "",
            countryCode: data.dest_country || data.delivery?.countryCode || "DE",
            zipCode: data.dest_zip || data.delivery?.zipCode || "",
            contactName: data.dest_contact || data.delivery?.contactName || "",
            contactPhoneNumber: formatPhoneNumber(data.dest_phone || data.delivery?.contactPhoneNumber || ""),
            residential: data.delivery?.residential !== undefined ? data.delivery.residential : (data.residential === 'on' || data.residential === true)
        },
        paymentInformation: {
            shippingChargesPayment: {
                paymentType: data.paymentInformation?.shippingChargesPayment?.paymentType || data.paymentType || "SENDER"
            },
            dutiesAndTaxesPayment: {
                paymentType: data.paymentInformation?.dutiesAndTaxesPayment?.paymentType || data.dutiesType || "RECEIVER"
            }
        },
        serviceOptions: {
            packageType: data.serviceOptions?.packageType || data.packageType || "PARCELS",
            serviceCode: data.serviceOptions?.serviceCode || data.serviceCode || "DSVAirExpress",
            insurance: data.insuranceValue ? {
                currencyCode: data.currencyCode || "CHF",
                monetaryValue: parseFloat(data.insuranceValue)
            } : undefined
        },
        notifications: data.notif_code ? [
            {
                notificationCode: data.notif_code, // e.g. DEP, DEL
                recipients: [data.notif_email]
            }
        ] : undefined,
        references: data.ref_value ? [
            {
                referenceQualifier: data.ref_qualifier || "SHPR_REF",
                referenceValue: data.ref_value
            }
        ] : undefined,
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
                originCountryCode: data.commodity_origin || data.origin_country || "CH",
                goodsDescription: data.commodity || "General Goods",
                goodsValue: {
                    currencyCode: data.currencyCode || "CHF",
                    monetaryValue: parseFloat(data.goodsValue || 0)
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
