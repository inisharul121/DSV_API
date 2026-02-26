const fs = require('fs');
const path = require('path');
const config = require('../config/env');

// This utility mimics processing label data.
// In a real scenario, it might merge PDFs, convert ZPL to PDF, etc.
// For now, it just ensures the file is valid.

exports.processLabel = async (labelData, bookingId, format = 'PDF') => {
    // Logic already partially handled in controller, moving it here for separation of concerns
    const fileName = `label-${bookingId}.${format.toLowerCase()}`;
    const filePath = path.join(config.paths.labels, fileName);

    if (!fs.existsSync(config.paths.labels)) {
        fs.mkdirSync(config.paths.labels, { recursive: true });
    }

    // labelData is assumed to be base64 string
    const buffer = Buffer.from(labelData, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    return fileName;
};
