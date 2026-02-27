const dsvClient = require('../config/dsv-api');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config/env');

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
            // Standard XP v2 paths
            `${config.dsv.endpoints.booking}/v2/bookings/labels/${shipmentId}?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/v2/shipments/${shipmentId}/labels?labelFormat=${labelFormat}`,
            // Paths with /booking prefix
            `${config.dsv.endpoints.booking}/booking/v2/bookings/labels/${shipmentId}?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/booking/v2/shipments/${shipmentId}/labels?labelFormat=${labelFormat}`,
            // v1 paths (fallback)
            `${config.dsv.endpoints.booking}/v1/bookings/labels/${shipmentId}?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/v1/shipments/${shipmentId}/labels?labelFormat=${labelFormat}`,
            // No version prefix (some XP endpoints use this)
            `${config.dsv.endpoints.booking}/bookings/labels/${shipmentId}?labelFormat=${labelFormat}`,
            `${config.dsv.endpoints.booking}/shipments/${shipmentId}/labels?labelFormat=${labelFormat}`
        ];

        let lastError = null;
        for (const url of pathsToTry) {
            try {
                console.log(`[LABEL] Attempting retrieval from: ${url}`);
                const response = await dsvClient.get(url);

                // Debug log the actual structure
                console.log(`[LABEL] Response Keys for ${url}:`, Object.keys(response.data || {}).join(', '));
                if (response.data.packageLabels?.length > 0) {
                    console.log(`[LABEL] packageLabels[0] keys:`, Object.keys(response.data.packageLabels[0]).join(', '));
                    if (response.data.packageLabels[0].labelContent) {
                        console.log(`[LABEL] labelContent found in packageLabels[0] (Length: ${response.data.packageLabels[0].labelContent.length})`);
                    } else {
                        console.log(`[LABEL] labelContent MISSING in packageLabels[0]`);
                    }
                }
                if (response.data.labelResults?.length > 0) {
                    console.log(`[LABEL] labelResults[0] keys:`, Object.keys(response.data.labelResults[0]).join(', '));
                    if (response.data.labelResults[0].labelContent) {
                        console.log(`[LABEL] labelContent found in labelResults[0] (Length: ${response.data.labelResults[0].labelContent.length})`);
                    } else {
                        console.log(`[LABEL] labelContent MISSING in labelResults[0]`);
                    }
                }

                const hasLabelResults = response.data?.labelResults && Array.isArray(response.data.labelResults) && response.data.labelResults.length > 0;
                const hasPackageLabels = response.data?.packageLabels && Array.isArray(response.data.packageLabels) && response.data.packageLabels.length > 0;

                if (hasLabelResults || hasPackageLabels) {
                    console.log(`[LABEL] Valid label structure found at: ${url}`);
                    return res.json({
                        success: true,
                        data: response.data
                    });
                } else {
                    console.warn(`[LABEL] Response from ${url} was successful but contained no labels.`);
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
