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

        // Add Price Breakdown to each service to match user's old site
        if (quoteResponse.data.services) {
            quoteResponse.data.services = quoteResponse.data.services.map(svc => {
                const total = parseFloat(svc.totalPrice);

                // Simulate a realistic breakdown for the UI
                const commission = 10.00; // Fixed commission as per screenshot example
                const fuelSurcharge = (total * 0.15).toFixed(2); // 15% fuel
                const basePrice = (total - commission - parseFloat(fuelSurcharge)).toFixed(2);

                return {
                    ...svc,
                    breakdown: {
                        basePrice: basePrice,
                        fuelSurcharge: fuelSurcharge,
                        commission: commission.toFixed(2),
                        homeDeliveryCharge: svc.serviceType === 'Home' ? "5.00" : "0.00",
                        totalPrice: total.toFixed(2)
                    }
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
