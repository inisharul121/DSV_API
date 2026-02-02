const dsvClient = require('../config/dsv-api');
const FormData = require('form-data'); // You might need to install this: npm install form-data
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
    try {
        const { draftId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { type } = req.body; // e.g., 'commercial_invoice'

        // POST /bookings/{draftId}/documents
        // Using 'form-data' library for backend-to-backend multipart upload
        const form = new FormData();
        form.append('file', fs.createReadStream(file.path), file.originalname);
        form.append('type', type || 'other');

        const response = await dsvClient.post(`/bookings/${draftId}/documents`, form, {
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
