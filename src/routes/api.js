const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const upload = require('../middleware/upload');
const trackingController = require('../controllers/trackingController');
const documentController = require('../controllers/documentController');

// Simple booking (JSON only)
router.post('/bookings/simple', bookingController.createSimpleBooking);

// Complex booking (Multipart)
router.post('/bookings/complex', upload.any(), bookingController.createComplexBooking);

// Document Upload
router.post('/bookings/:draftId/documents', upload.single('file'), documentController.uploadDocument);

// Tracking
router.get('/shipments/:shipmentId/tracking', trackingController.trackShipment);

module.exports = router;
