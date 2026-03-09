const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const upload = require('../middleware/upload');
const trackingController = require('../controllers/trackingController');
const documentController = require('../controllers/documentController');
const quoteController = require('../controllers/quoteController');
const certificationController = require('../controllers/certificationController');
const orderController = require('../controllers/orderController');
const reportController = require('../controllers/reportController');
const customerAuthController = require('../controllers/customerAuthController');
const adminAuthController = require('../controllers/adminAuthController');
const customerOrderController = require('../controllers/customerOrderController');
const customerAuth = require('../middleware/customerAuth');
const adminAuth = require('../middleware/adminAuth');
const certMiddleware = require('../middleware/certification');

// Quotes
router.post('/quotes', quoteController.getQuotes);
router.get('/quotes', adminAuth, quoteController.getRecentQuotes); // Default to adminAuth for now

// Certification Testing
router.get('/certification/tests', certificationController.getTestCases);
router.post('/certification/run/:testId', certificationController.runTest);

// Apply certification middleware to all booking-related routes
router.use('/bookings', certMiddleware);

// Simple booking (JSON only)
router.post('/bookings/simple', bookingController.createSimpleBooking);

// Complex booking (Multipart)
router.post('/bookings/complex', upload.any(), bookingController.createComplexBooking);

// Document Upload
router.post('/bookings/:draftId/documents', upload.single('file'), documentController.uploadDocument);
router.post('/bookings/:shipmentId/labels', documentController.getShipmentLabels);

// Admin: All Orders
router.get('/orders', adminAuth, orderController.getOrders);
router.get('/orders/stats', adminAuth, orderController.getDashboardStats);

// Reports
router.get('/reports/monthly', adminAuth, reportController.getMonthlyReport);

// Admin: User Management
router.get('/admins', adminAuth, adminAuthController.getAllAdmins);
router.put('/admins/:id', adminAuth, adminAuthController.updateAdmin);
router.delete('/admins/:id', adminAuth, adminAuthController.deleteAdmin);
router.put('/admins/:id/status', adminAuth, adminAuthController.updateAdminStatus);
router.get('/customers', adminAuth, customerAuthController.getAllCustomers);
router.put('/customers/:id', adminAuth, customerAuthController.updateCustomerAdmin);
router.delete('/customers/:id', adminAuth, customerAuthController.deleteCustomer);
router.get('/customers/:id/summary', adminAuth, customerAuthController.getCustomerSummary);

// Tracking
router.get('/tracking/shipments/:shipmentId', trackingController.getShipmentDetails);
router.get('/tracking/shipments/:shipmentId/events', trackingController.getShipmentEvents);
router.get('/tracking/awb/:awbNumber/events', trackingController.getShipmentEventsByAWB);
router.get('/tracking/carrier/:carrierId/events', trackingController.getShipmentEventsByCarrierID);

// Legacy/Alternative tracking path
router.get('/shipments/:shipmentId/tracking', trackingController.trackShipment);

// Customer Auth (no authentication required)
router.post('/auth/customer/register', customerAuthController.register);
router.post('/auth/customer/login', customerAuthController.login);
router.get('/auth/customer/me', customerAuth, customerAuthController.me);
router.put('/auth/customer/profile', customerAuth, customerAuthController.updateProfile);

// Admin Auth
router.post('/auth/admin/register', adminAuthController.register);
router.post('/auth/admin/login', adminAuthController.login);
router.get('/auth/admin/me', adminAuth, adminAuthController.me);

// Customer Portal: Customer-scoped orders (requires customer JWT)
router.get('/customer/orders', customerAuth, customerOrderController.getMyOrders);

module.exports = router;
