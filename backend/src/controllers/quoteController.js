const dsvClient = require('../config/dsv-api');
const config = require('../config/env');
const payloadBuilder = require('../utils/payloadBuilder');

exports.getQuotes = async (req, res) => {
    try {
        const quoteRequestData = req.body;

        // Transform frontend data to DSV API Quote format
        const dsvPayload = payloadBuilder.buildQuotePayload(quoteRequestData);

        console.log('Sending Quote Payload to DSV:', JSON.stringify(dsvPayload, null, 2));

        // Endpoint: https://api.dsv.com/xp/comparator/v2/compare
        const quoteUrl = config.dsv.endpoints.quote;

        const quoteResponse = await dsvClient.post(quoteUrl, dsvPayload);

        // Enhance each service with a detailed price breakdown
        if (quoteResponse.data.services) {
            quoteResponse.data.services = quoteResponse.data.services.map(svc => {
                const total = parseFloat(svc.totalPrice || (svc.rates && svc.rates.total) || 0);

                // If DSV provides a breakdown, use it, otherwise simulate a detailed one
                const realBreakdown = svc.rates && svc.rates.priceBreakdown ? svc.rates.priceBreakdown : [];
                const realSurcharges = svc.rates && svc.rates.otherSurcharges ? svc.rates.otherSurcharges : [];

                // Combine real data into a standard format for the frontend
                const detailedBreakdown = [
                    ...realBreakdown.map(b => ({ label: b.description || 'Freight', value: b.monetaryValue })),
                    ...realSurcharges.map(s => ({ label: s.description || 'Surcharge', value: s.monetaryValue }))
                ];

                // Fallback simulation if no breakdown items are found
                if (detailedBreakdown.length === 0) {
                    const commission = 10.00;
                    const fuelSurcharge = (total * 0.15);
                    const baseFreight = total - commission - fuelSurcharge;

                    detailedBreakdown.push(
                        { label: 'Base Freight', value: baseFreight.toFixed(2) },
                        { label: 'Fuel Surcharge (15%)', value: fuelSurcharge.toFixed(2) },
                        { label: 'Commission / Service Fee', value: commission.toFixed(2) }
                    );
                }

                return {
                    ...svc,
                    detailedBreakdown,
                    totalDisplay: total.toFixed(2),
                    currency: (svc.rates && svc.rates.currency) || 'CHF'
                };
            });
        }

        res.status(200).json({
            success: true,
            data: quoteResponse.data
        });

    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error('DSV Quote API Error - STATUS:', error.response?.status);
        console.error('DSV Quote API Error - FULL BODY:', JSON.stringify(errorData, null, 2));

        res.status(error.response?.status || 500).json({
            success: false,
            error: errorData
        });
    }
};
