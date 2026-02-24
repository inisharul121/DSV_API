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

        res.status(200).json({
            success: true,
            data: quoteResponse.data
        });

    } catch (error) {
        console.error('DSV Quote API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};
