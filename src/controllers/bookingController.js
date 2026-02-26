const dsvClient = require('../config/dsv-api');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
// const labelGenerator = require('../utils/labelGenerator'); // TODO: Implement this

// Helper to save label from base64 or buffer
const saveLabel = async (labelData, bookingId) => {
    const fileName = `label-${bookingId}.pdf`;
    const filePath = path.join(config.paths.labels, fileName);

    // Ensure directory exists
    if (!fs.existsSync(config.paths.labels)) {
        fs.mkdirSync(config.paths.labels, { recursive: true });
    }

    // If labelData is base64 string
    const buffer = Buffer.from(labelData, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    return fileName;
};

const payloadBuilder = require('../utils/payloadBuilder');

exports.createSimpleBooking = async (req, res) => {
    try {
        const { shipmentData } = req.body;
        console.log('[BOOKING] Received Request Body:', JSON.stringify(req.body, null, 2));

        // Transform frontend data to DSV API format
        const dsvPayload = payloadBuilder.buildBookingPayload(shipmentData);

        console.log('Sending Payload to DSV:', JSON.stringify(dsvPayload, null, 2));

        // 1. Submit Draft Booking
        const bookingUrl = `${config.dsv.endpoints.booking}/booking/v2/bookings`;
        const draftResponse = await dsvClient.post(bookingUrl, dsvPayload);

        const bookingId = draftResponse.data.shipmentIdentificationNumber || draftResponse.data.bookingId;

        if (!bookingId) {
            console.error('DSV Response missing ID:', draftResponse.data);
            throw new Error('Failed to create booking: No Booking ID or Shipment ID returned');
        }

        console.log(`Draft Shipment Created: ${bookingId}`);

        // 2. Confirm Booking and Get Labels
        // Endpoint: /booking/v2/bookings/{bookingId}/labels
        const labelUrl = `${config.dsv.endpoints.booking}/booking/v2/bookings/${bookingId}/labels`;

        console.log(`Confirming and requesting labels for: ${bookingId}`);
        const labelResponse = await dsvClient.post(labelUrl, {
            labelFormat: "PDF"
        });

        // The response format for labels often contains base64 data in packageLabels or similar
        // Let's assume the DSV API returns an object with label data.
        let savedLabelPath = null;
        if (labelResponse.data && labelResponse.data.packageLabels && labelResponse.data.packageLabels.length > 0) {
            const labelContent = labelResponse.data.packageLabels[0].labelContent;
            savedLabelPath = await saveLabel(labelContent, bookingId);
            console.log(`Label saved to: ${savedLabelPath}`);
        }

        res.status(201).json({
            success: true,
            bookingId,
            shipmentId: bookingId,
            labelUrl: savedLabelPath ? `/labels/${savedLabelPath}` : null,
            trackingUrl: `https://track.dsv.com?bookingId=${bookingId}`
        });

    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error('DSV API Error Body:', JSON.stringify(errorData, null, 2));
        res.status(error.response?.status || 500).json({
            success: false,
            error: errorData
        });
    }
};



exports.createComplexBooking = async (req, res) => {
    try {
        const { shipmentData } = req.body;
        const files = req.files; // processed by multer

        // 1. Submit Draft
        const draftUrl = `${config.dsv.endpoints.booking}/bookings/draft`;
        const draftResponse = await dsvClient.post(draftUrl, shipmentData);
        const { draftId } = draftResponse.data;

        // 2. Upload Documents
        if (files && files.length > 0) {
            for (const file of files) {
                // multipart/form-data upload
                const docUrl = `${config.dsv.endpoints.booking}/bookings/${draftId}/documents`;
                const formData = new FormData();
                formData.append('file', new Blob([file.buffer]), file.originalname);
                formData.append('type', file.fieldname); // e.g., 'invoice'

                // Need to handle FormData headers with axios, simpler way might be needed in Node
                // for now, pseudo-code thought process
                /*
                await dsvClient.post(docUrl, formData, {
                   headers: { ...formDataHeaders }
                });
                */
                console.log(`[Mock] Uploading ${file.originalname} for draft ${draftId}`);
            }
        }

        // 3. Confirm
        const confirmUrl = `${config.dsv.endpoints.booking}/bookings/${draftId}/confirm`;
        const confirmResponse = await dsvClient.post(confirmUrl, {
            labelFormat: 'PDF'
        });

        // ... handle response same as simple booking
        res.status(201).json({
            success: true,
            bookingId: confirmResponse.data.bookingId,
            // ...
        });

    } catch (error) {
        console.error('Complex Booking Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};
