const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const config = require('../config/env');

/**
 * Uploads a document PDF to a draft booking in DSV.
 */
exports.uploadDocumentToDraft = async (draftId, filePath, documentType = 'COMMERCIAL_INVOICE') => {
    try {
        console.log(`[DSV] Uploading ${documentType} for draft: ${draftId}`);

        const url = `${config.dsv.endpoints.booking}/booking/v2/bookings/documents/${draftId}`;

        const formData = new FormData();
        formData.append('File', fs.createReadStream(filePath));
        formData.append('DocumentType', documentType);

        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                'dsv-subscription-key': config.dsv.subscriptionKey,
                'dsv-service-auth': config.dsv.serviceAuth,
                'x-pat': config.dsv.pat
            }
        });

        console.log(`[DSV] Document uploaded successfully:`, response.data);
        return response.data;
    } catch (error) {
        console.error('[DSV] Document Upload Error:', error.response?.data || error.message);
        throw error;
    }
};
