const multer = require('multer');
const path = require('path');
const config = require('../config/env');
const fs = require('fs');
const os = require('os');

// On Vercel the filesystem is read-only; use /tmp for uploads.
// Locally, use the ./public/uploads directory.
const uploadDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'uploads')
    : path.resolve('./public/uploads');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create directory lazily (only when an upload actually happens)
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Basic file filter (PDFs and specific images)
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed!'), false);
        }
    }
});

module.exports = upload;
