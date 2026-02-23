const dsvClient = require('../config/dsv-api');
const config = require('../config/env');

/**
 * Shipment details (by DSV XPress Shipment ID)
 * GET /shipments/:shipmentId
 */
exports.getShipmentDetails = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const url = `${config.dsv.endpoints.tracking}/shipments/${shipmentId}`;
        const response = await dsvClient.get(url);

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Tracking Details Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};

/**
 * Shipment events (by DSV XPress Shipment ID)
 * GET /shipments/:shipmentId/events
 */
exports.getShipmentEvents = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const url = `${config.dsv.endpoints.tracking}/shipments/${shipmentId}/events`;
        const response = await dsvClient.get(url);

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Tracking Events Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};

/**
 * Shipment events (by AWB number)
 * GET /awb/:awbNumber/events
 */
exports.getShipmentEventsByAWB = async (req, res) => {
    try {
        const { awbNumber } = req.params;
        const url = `${config.dsv.endpoints.tracking}/awbs/${awbNumber}/events`;
        const response = await dsvClient.get(url);

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Tracking AWB Events Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};

/**
 * Shipment events (by Carrier tracking ID)
 * GET /carrier/:carrierId/events
 */
exports.getShipmentEventsByCarrierID = async (req, res) => {
    try {
        const { carrierId } = req.params;
        const url = `${config.dsv.endpoints.tracking}/carriers/${carrierId}/events`;
        const response = await dsvClient.get(url);

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Tracking Carrier Events Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};

// Legacy support or generic tracking
exports.trackShipment = exports.getShipmentDetails;

