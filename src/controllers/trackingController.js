const dsvClient = require('../config/dsv-api');
const config = require('../config/env');

/**
 * Shipment details (by DSV XPress Shipment ID)
 * GET /tracking/shipments/:shipmentId
 */
exports.getShipmentDetails = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        console.log(`[Tracking Controller] Fetching details for: ${shipmentId}`);
        const url = `${config.dsv.endpoints.tracking}/shipmentDetails/${shipmentId}`;
        console.log(`[Tracking Controller] Details URL: ${url}`);
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
 * GET /tracking/shipments/:shipmentId/events
 */
exports.getShipmentEvents = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        console.log(`[Tracking Controller] Fetching events for ID: ${shipmentId}`);
        const url = `${config.dsv.endpoints.tracking}/shipments/shipmentId/${shipmentId}`;
        console.log(`[Tracking Controller] Events URL: ${url}`);
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
 * GET /tracking/awb/:awbNumber/events
 */
exports.getShipmentEventsByAWB = async (req, res) => {
    try {
        const { awbNumber } = req.params;
        const url = `${config.dsv.endpoints.tracking}/shipments/awb/${awbNumber}`;
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
 * GET /tracking/carrier/:carrierId/events
 */
exports.getShipmentEventsByCarrierID = async (req, res) => {
    try {
        const { carrierId } = req.params;
        const url = `${config.dsv.endpoints.tracking}/shipments/carrierTrackingNumber/${carrierId}`;
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

