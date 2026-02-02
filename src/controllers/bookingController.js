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

        // Transform frontend data to DSV API format
        const dsvPayload = payloadBuilder.buildBookingPayload(shipmentData);

        console.log('Sending Payload to DSV:', JSON.stringify(dsvPayload, null, 2));

        // 1. Submit Draft Booking
        // Endpoint: /booking/v2/bookings
        // Endpoint: /booking/v2/bookings
        // Config base is https://api.dsv.com/my-demo
        const bookingUrl = `${config.dsv.endpoints.booking}/booking/v2/bookings`;

        const draftResponse = await dsvClient.post(bookingUrl, dsvPayload);

        // Response format: { bookingId: "..." }
        const { bookingId } = draftResponse.data;

        if (!bookingId) {
            throw new Error('Failed to create booking: No Booking ID returned');
        }

        console.log(`Draft Created: ${bookingId}`);

        // 2. Confirm Booking (If needed, or just return draft ID for now)
        // Note: For simple bookings in the docs, "Submit Draft" is step 1.
        // There is a separate endpoint to confirm/label if we want labels immediately.
        // Endpoint: /booking/v2/bookings/{bookingId}/labels (implied from "Confirm draft... download labels")
        // However, docs say "Confirm draft booking and download package label(s)" 
        // usually is a PUT or POST to /bookings/{id}/confirm or similar.
        // Let's assume for this step we just return the bookingId as success for the draft.
        // Start simple.

        res.status(201).json({
            success: true,
            bookingId,
            shipmentId: bookingId, // DSV often uses same ID or returns shipmentId separately. Using bookingId for now.
            labelUrl: null, // Label generation would be a next step
            trackingUrl: `https://track.dsv.com?bookingId=${bookingId}`
        });

    } catch (error) {
        console.error('DSV API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
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
