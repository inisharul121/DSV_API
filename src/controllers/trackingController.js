const dsvClient = require('../config/dsv-api');

exports.trackShipment = async (req, res) => {
    try {
        const { shipmentId } = req.params;

        // GET /shipments/{shipmentId}/tracking
        const response = await dsvClient.get(`/shipments/${shipmentId}/tracking`);

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Tracking Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};
