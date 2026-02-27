const dsvClient = require('../config/dsv-api');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config/env');
const labelExtractor = require('../utils/labelExtractor');

exports.uploadDocument = async (req, res) => {
    try {
        const { draftId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { type } = req.body; // e.g., 'commercial_invoice'

        // POST /bookings/{draftId}/documents
        const docUrl = `${config.dsv.endpoints.booking}/bookings/${draftId}/documents`;

        // Using 'form-data' library for backend-to-backend multipart upload
        const form = new FormData();
        form.append('file', fs.createReadStream(file.path), file.originalname);
        form.append('type', type || 'other');

        const response = await dsvClient.post(docUrl, form, {
            headers: {
                ...form.getHeaders()
            }
        });


        // Clean up temp file
        // fs.unlinkSync(file.path); 

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Document Upload Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};

exports.getShipmentLabels = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const { labelFormat = 'PDF' } = req.query;

        // Try both common patterns for confirmed shipments
        const pathsToTry = [
            `${config.dsv.endpoints.booking}/v2/bookings/labels/${shipmentId}?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/booking/v2/bookings/labels/${shipmentId}?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/booking/v2/shipments/${shipmentId}/labels?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/v2/bookings/labels/${shipmentId}`,
            `${config.dsv.endpoints.booking}/booking/v2/bookings/labels/${shipmentId}`,
            `${config.dsv.endpoints.booking}/booking/v2/shipments/${shipmentId}/labels`
        ];

        let lastError = null;
        for (const url of pathsToTry) {
            try {
                console.log(`[LABEL] Attempting retrieval from: ${url}`);
                const response = await dsvClient.get(url);

                const labelContent = labelExtractor.extractLabelContent(response.data);

                if (labelContent) {
                    console.log(`[LABEL] Valid label content found at: ${url}`);
                    return res.json({
                        success: true,
                        data: response.data,
                        pdfBase64: labelContent
                    });
                } else {
                    console.warn(`[LABEL] Response from ${url} was successful but contained no labels or content.`);
                }
            } catch (err) {
                const status = err.response?.status;
                const message = err.response?.data?.message || err.message;
                console.warn(`[LABEL] Path failed: ${url} (${status}: ${message})`);
                lastError = err;
            }
        }

        throw lastError || new Error('All label retrieval paths failed');

    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error('Label Retrieval Error:', errorData);
        res.status(error.response?.status || 500).json({
            success: false,
            error: errorData
        });
    }
};
