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

exports.createSimpleBooking = async (req, res) => {
    try {
        const { shipmentData } = req.body;

        // 1. Submit Draft Booking
        // POST /bookings/draft
        const draftResponse = await dsvClient.post('/bookings/draft', shipmentData);
        const { draftId } = draftResponse.data;

        if (!draftId) {
            throw new Error('Failed to create draft booking');
        }

        // 2. Confirm Booking
        // POST /bookings/{draftId}/confirm
        const confirmResponse = await dsvClient.post(`/bookings/${draftId}/confirm`, {
            labelFormat: 'PDF' // or ZPL
        });

        const { bookingId, shipmentId, labelData } = confirmResponse.data;

        // 3. Save Label
        // If API returns label directly, save it. If it returns a link, might need to fetch it.
        // Assuming base64 data for now based on typical integrations.
        let labelUrl = '';
        if (labelData) {
            const labelFile = await saveLabel(labelData, bookingId);
            labelUrl = `/labels/${labelFile}`;
        }

        res.status(201).json({
            success: true,
            bookingId,
            shipmentId,
            labelUrl,
            trackingUrl: `https://track.dsv.com?shipmentId=${shipmentId}` // Example URL
        });

    } catch (error) {
        console.error('Booking Error:', error.response?.data || error.message);
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
        const draftResponse = await dsvClient.post('/bookings/draft', shipmentData);
        const { draftId } = draftResponse.data;

        // 2. Upload Documents
        if (files && files.length > 0) {
            for (const file of files) {
                // multipart/form-data upload
                // Note: Implementation depends on specific DSV endpoint for docs
                // POST /bookings/{draftId}/documents
                const formData = new FormData();
                formData.append('file', new Blob([file.buffer]), file.originalname);
                formData.append('type', file.fieldname); // e.g., 'invoice'

                // Need to handle FormData headers with axios, simpler way might be needed in Node
                // for now, pseudo-code thought process
                /*
                await dsvClient.post(`/bookings/${draftId}/documents`, formData, {
                   headers: { ...formDataHeaders }
                });
                */
                console.log(`[Mock] Uploading ${file.originalname} for draft ${draftId}`);
            }
        }

        // 3. Confirm
        const confirmResponse = await dsvClient.post(`/bookings/${draftId}/confirm`, {
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
