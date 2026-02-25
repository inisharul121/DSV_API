const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const upload = require('../middleware/upload');
const trackingController = require('../controllers/trackingController');
const documentController = require('../controllers/documentController');
const quoteController = require('../controllers/quoteController');

// Quotes
router.post('/quotes', quoteController.getQuotes);

// Simple booking (JSON only)
router.post('/bookings/simple', bookingController.createSimpleBooking);

// Complex booking (Multipart)
router.post('/bookings/complex', upload.any(), bookingController.createComplexBooking);

// Document Upload
router.post('/bookings/:draftId/documents', upload.single('file'), documentController.uploadDocument);

// Tracking
router.get('/orders', trackingController.getShipments);
router.get('/tracking/shipments/:shipmentId', trackingController.getShipmentDetails);
router.get('/tracking/shipments/:shipmentId/events', trackingController.getShipmentEvents);
router.get('/tracking/awb/:awbNumber/events', trackingController.getShipmentEventsByAWB);
router.get('/tracking/carrier/:carrierId/events', trackingController.getShipmentEventsByCarrierID);

// Legacy/Alternative tracking path
router.get('/shipments/:shipmentId/tracking', trackingController.trackShipment);

module.exports = router;
