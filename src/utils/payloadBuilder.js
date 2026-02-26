const config = require('../config/env');

/**
 * Ensures phone number matches DSV regex: ^[+]?[0-9]{1,4} [0-9]{1}[0-9 ]{1,}
 * Requires a space after the country code.
 */
const formatPhoneNumber = (num) => {
    if (!num) return num;
    num = num.trim();

    // If it already matches or has a space, return as is
    if (/^[+]?[0-9]{1,4} [0-9]/.test(num)) {
        return num;
    }

    // Remove all non-numeric characters except + for processing
    const clean = num.replace(/[^\d+]/g, '');

    // Heuristic: If starts with + followed by digits, insert space after first 3 chars (+XX) 
    // or first 4 chars (+XXX) if we want to be safe. 
    // Most common: +4178... -> +41 78...
    if (clean.startsWith('+')) {
        if (clean.length > 5) {
            // Check if it's +41... (Swiss)
            if (clean.startsWith('+41')) return '+41 ' + clean.substring(3);
            if (clean.startsWith('+49')) return '+49 ' + clean.substring(3);
            if (clean.startsWith('+45')) return '+45 ' + clean.substring(3);
            if (clean.startsWith('+44')) return '+44 ' + clean.substring(3);
            if (clean.startsWith('+1')) return '+1 ' + clean.substring(2);

            // Generic fallback: space after the + and first two digits
            return clean.substring(0, 3) + ' ' + clean.substring(3);
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

    const formatDSVDate = (date) => {
        if (!date) return undefined;
        const d = (typeof date === 'string') ? new Date(date) : date;
        // Ensure it's a valid date, otherwise return original string or now
        if (isNaN(d.getTime())) return date;
        return d.toISOString().split('.')[0] + 'Z';
    };

    // Base structure with defaults
    const payload = {
        dsvAccount: parseInt(data.dsvAccount || config.dsv.account),
        sender: {
            companyName: data.origin_company || data.pickup?.address?.companyName || "Sender",
            addressLine1: data.origin_address || data.pickup?.address?.addressLine1 || "",
            city: data.origin_city || data.pickup?.address?.city || "",
            countryCode: (data.origin_country || data.pickup?.address?.countryCode || "CH").trim().substring(0, 2).toUpperCase(),
            zipCode: data.origin_zip || data.pickup?.address?.zipCode || "",
            contactName: data.origin_contact || data.pickup?.address?.contactName || "",
            contactPhoneNumber: formatPhoneNumber(data.origin_phone || data.pickup?.address?.contactPhoneNumber || "")
        },
        receiver: {
            companyName: data.dest_company || data.delivery?.companyName || "Receiver",
            addressLine1: data.dest_address || data.delivery?.addressLine1 || "",
            city: data.dest_city || data.delivery?.city || "",
            state: data.dest_state || data.delivery?.state || undefined,
            countryCode: (data.dest_country || data.delivery?.countryCode || "DE").trim().substring(0, 2).toUpperCase(),
            zipCode: data.dest_zip || data.delivery?.zipCode || "",
            contactName: data.dest_contact || data.delivery?.contactName || "",
            contactPhoneNumber: formatPhoneNumber(data.dest_phone || data.delivery?.contactPhoneNumber || ""),
            residential: data.delivery?.residential !== undefined ? data.delivery.residential : (data.residential === 'on' || data.residential === true)
        },
        pickup: {
            requestPickup: data.pickup?.requestPickup !== undefined ? data.pickup.requestPickup : true,
            collectDateFrom: formatDSVDate(data.collectDateFrom || data.pickup?.collectDateFrom || collectFrom),
            collectDateTo: formatDSVDate(data.collectDateTo || data.pickup?.collectDateTo || collectTo),
            pickupInstructions: data.pickup?.pickupInstructions || data.pickupInstructions || "Ready at front desk",
            address: {
                companyName: data.origin_company || data.pickup?.address?.companyName || "Sender",
                addressLine1: data.origin_address || data.pickup?.address?.addressLine1 || "",
                city: data.origin_city || data.pickup?.address?.city || "",
                countryCode: (data.origin_country || data.pickup?.address?.countryCode || "CH").trim().substring(0, 2).toUpperCase(),
                zipCode: data.origin_zip || data.pickup?.address?.zipCode || "",
                contactName: data.origin_contact || data.pickup?.address?.contactName || "",
                contactPhoneNumber: formatPhoneNumber(data.origin_phone || data.pickup?.address?.contactPhoneNumber || "")
            }
        },
        delivery: {
            companyName: data.dest_company || data.delivery?.companyName || "Receiver",
            addressLine1: data.dest_address || data.delivery?.addressLine1 || "",
            city: data.dest_city || data.delivery?.city || "",
            state: data.dest_state || data.delivery?.state || undefined,
            countryCode: (data.dest_country || data.delivery?.countryCode || "DE").trim().substring(0, 2).toUpperCase(),
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
            insurance: (data.insuranceValue && parseFloat(data.insuranceValue) > 0) ? {
                currencyCode: data.currencyCode || "CHF",
                monetaryValue: parseFloat(data.insuranceValue)
            } : undefined
        },
        notifications: (() => {
            const notifs = [];
            if (data.notif_code_1 && data.notif_email_1) notifs.push({ notificationCode: data.notif_code_1, recipients: [data.notif_email_1] });
            if (data.notif_code_2 && data.notif_email_2) notifs.push({ notificationCode: data.notif_code_2, recipients: [data.notif_email_2] });
            return notifs.length > 0 ? notifs : undefined;
        })(),
        references: (data.ref_value && data.ref_value.trim() !== "") ? [
            {
                qualifier: data.ref_qualifier || "SHPR_REF",
                reference: data.ref_value
            }
        ] : undefined,
        dimensionUnit: data.dimensionUnit || "CM",
        weightUnit: data.weightUnit || "KG",
        packages: (() => {
            const pkgs = [];
            if (data.length && data.width && data.height && data.weight) {
                pkgs.push({
                    length: parseFloat(data.length),
                    width: parseFloat(data.width),
                    height: parseFloat(data.height),
                    grossWeight: parseFloat(data.weight)
                });
            }
            if (data.length2 && data.width2 && data.height2 && data.weight2) {
                pkgs.push({
                    length: parseFloat(data.length2),
                    width: parseFloat(data.width2),
                    height: parseFloat(data.height2),
                    grossWeight: parseFloat(data.weight2)
                });
            }
            return pkgs.length > 0 ? pkgs : [{ length: 1, width: 1, height: 1, grossWeight: 0.1 }]; // Simple fallback
        })(),
        commodities: (data.goodsValue && parseFloat(data.goodsValue) > 0) ? [
            {
                originCountryCode: data.commodity_origin || data.origin_country || "CH",
                goodsDescription: data.commodity || "General Goods",
                goodsValue: {
                    currencyCode: data.commodity_currency || data.currencyCode || "CHF",
                    monetaryValue: parseFloat(data.goodsValue)
                }
            }
        ] : undefined
    };

    return payload;
};

exports.buildQuotePayload = (data) => {
    // Collect Date defaults to today if not provided, format yyyy-MM-dd
    const now = new Date();
    const collectDateStr = data.collectDate || now.toISOString().split('T')[0];

    const pickupCountry = data.pickupCountryCode || data.pickup?.address?.countryCode || data.origin_country || "CH";
    const deliveryCountry = data.deliveryCountryCode || data.delivery?.countryCode || data.dest_country || "DE";

    return {
        dsvAccount: parseInt(data.dsvAccount || config.dsv.account),
        pickupCountryCode: pickupCountry.trim().substring(0, 2).toUpperCase(),
        pickupCity: data.pickupCity || data.pickup?.address?.city || data.origin_city || "Baar",
        pickupZipCode: data.pickupZipCode || data.pickup?.address?.zipCode || data.origin_zip || "6340",
        deliveryCountryCode: deliveryCountry.trim().substring(0, 2).toUpperCase(),
        deliveryCity: data.deliveryCity || data.delivery?.city || data.dest_city || undefined,
        deliveryZipCode: data.deliveryZipCode || data.delivery?.address?.zipCode || data.dest_zip || undefined,
        residentialDelivery: data.residentialDelivery === true || data.residentialDelivery === 'true',
        serviceOptions: {
            packageType: data.packageType || "PARCELS",
            saturdayDelivery: data.saturdayDelivery === true || data.saturdayDelivery === 'true',
            insurance: (data.insuranceValue || data.insuranceCurrency) ? {
                currencyCode: data.insuranceCurrency || data.currencyCode || "CHF",
                monetaryValue: parseFloat(data.insuranceValue || 0)
            } : undefined
        },
        dimensionUnit: data.dimensionUnit || "CM",
        weightUnit: data.weightUnit || "KG",
        packages: data.packages && data.packages.length > 0 ? data.packages.map(p => ({
            length: p.length ? parseFloat(p.length) : undefined,
            width: p.width ? parseFloat(p.width) : undefined,
            height: p.height ? parseFloat(p.height) : undefined,
            grossWeight: parseFloat(p.grossWeight || p.weight || 1.0)
        })) : [{
            length: parseFloat(data.length || 10),
            width: parseFloat(data.width || 10),
            height: parseFloat(data.height || 10),
            grossWeight: parseFloat(data.weight || 1.0)
        }],
        collectDate: collectDateStr
    };
};
