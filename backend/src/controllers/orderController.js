const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const Order = require('../models/Order');
const ProformaInvoice = require('../models/ProformaInvoice');
const invoiceGenerator = require('../utils/invoiceGenerator');

exports.getOrders = async (req, res) => {
    try {
        console.log('[OrderController] Fetching all orders...');
        const orders = await Order.findAll({
            include: [{ model: ProformaInvoice, as: 'invoice' }],
            order: [['createdAt', 'DESC']]
        });
        console.log(`[OrderController] Found ${orders.length} orders.`);

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Fetch Orders Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Fetch Order Detail Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('[OrderController] Fetching dashboard stats...');
        const totalShipments = await Order.count();
        const delivered = await Order.count({ where: { status: 'Delivered' } });
        // In processing includes 'Created', 'In Transit', 'Pending'
        const inProcessing = await Order.count({
            where: {
                status: ['Created', 'In Transit', 'Pending', 'Booked']
            }
        });
        const exceptions = await Order.count({
            where: {
                status: ['Exception', 'Failed', 'Cancelled']
            }
        });

        res.json({
            success: true,
            data: {
                totalShipments,
                delivered,
                inProcessing,
                exceptions
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.generateOrderInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        console.log(`[OrderController] Generating PDF Buffer for order: ${order.bookingId}`);

        try {
            const buffer = await invoiceGenerator.generateProformaInvoiceBuffer({
                ...order.toJSON(),
                origin_company: order.shipperName,
                origin_address: order.originAddress,
                origin_city: order.originCity,
                origin_zip: order.originZip,
                origin_country: order.originCountry,
                origin_phone: order.originPhone,
                origin_email: order.originEmail,
                dest_company: order.receiverName,
                dest_address: order.destAddress,
                dest_city: order.destCity,
                dest_zip: order.destZip,
                dest_country: order.destinationCountry,
                dest_contact: order.destContact,
                dest_phone: order.destPhone,
                dest_email: order.destEmail,
                weight: order.totalWeight,
                currencyCode: order.currency,
                invoice_date: order.createdAt
            }, order.bookingId);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=invoice.pdf`);
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.send(buffer);
        } catch (genError) {
            console.error('PDF Generation Error:', genError);
            res.status(500).send(`<h1>PDF Generation Failed</h1><p>${genError.message}</p>`);
        }

    } catch (error) {
        console.error('Invoice Generation Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getOrderInvoiceHTML = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({
            where: { id },
            include: [{ model: ProformaInvoice, as: 'invoice' }]
        });

        if (!order) {
            return res.status(404).send('<h1>Order Not Found</h1>');
        }

        const html = invoiceGenerator.generateProformaInvoiceHTML({
            ...order.toJSON(),
            origin_company: order.shipperName,
            origin_address: order.originAddress,
            origin_city: order.originCity,
            origin_zip: order.originZip,
            origin_country: order.originCountry,
            origin_phone: order.originPhone,
            origin_email: order.originEmail,
            dest_company: order.receiverName,
            dest_address: order.destAddress,
            dest_city: order.destCity,
            dest_zip: order.destZip,
            dest_country: order.destinationCountry,
            dest_contact: order.destContact,
            dest_phone: order.destPhone,
            dest_email: order.destEmail,
            weight: order.totalWeight,
            currencyCode: order.invoice?.currency || order.currency,
            totalShippingPrice: order.invoice?.totalAmount || order.totalShippingPrice,
            baseShippingPrice: order.invoice?.baseAmount || order.baseShippingPrice,
            hawb: order.awb,
            invoice_date: order.createdAt
        }, order.bookingId);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.send(html);
    } catch (error) {
        console.error('Admin HTML Invoice Error:', error.message);
        res.status(500).send(`<h1>Error generating invoice preview</h1><p>${error.message}</p>`);
    }
};

/**
 * Dynamic serving of labels (stored in DB as base64)
 * Matches: /api/labels/label-:bookingId.pdf
 */
exports.serveDynamicLabel = async (req, res) => {
    try {
        const { filename } = req.params;
        const bookingId = filename.replace('label-', '').replace('.pdf', '');
        
        console.log(`[ServeLabel] Requested: ${filename}, BookingID: ${bookingId}`);

        const order = await Order.findOne({ where: { bookingId } });
        
        // 1. Try serving from Database (Base64)
        if (order && order.labelData) {
            console.log(`[ServeLabel] Found label in DB for ${bookingId}`);
            const buffer = Buffer.from(order.labelData, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${filename}`);
            return res.send(buffer);
        }

        // 2. Fallback: Try serving from Filesystem
        const filePath = path.join(config.paths.labels, filename);
        if (fs.existsSync(filePath)) {
            console.log(`[ServeLabel] Found physical file for ${filename}, serving from disk.`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${filename}`);
            return res.sendFile(filePath);
        }

        console.warn(`[ServeLabel] Label NOT found for ${bookingId} in DB or disk.`);
        res.status(404).send('<h1>Label Not Found</h1><p>The requested label could not be found in our records or on disk.</p>');
    } catch (error) {
        console.error('Dynamic Label Serve Error:', error);
        res.status(500).send('Error retrieving label');
    }
};

/**
 * Dynamic serving of invoices (re-generated on the fly)
 * Matches: /api/invoices/proforma-:bookingId.pdf
 */
exports.serveDynamicInvoice = async (req, res) => {
    try {
        const { filename } = req.params;
        const bookingId = filename.replace('proforma-', '').replace('.pdf', '');
        
        const order = await Order.findOne({ where: { bookingId } });
        if (!order) {
            return res.status(404).send('<h1>Invoice Not Found</h1>');
        }

        const buffer = await invoiceGenerator.generateProformaInvoiceBuffer({
            ...order.toJSON(),
            origin_company: order.shipperName,
            origin_address: order.originAddress,
            origin_city: order.originCity,
            origin_zip: order.originZip,
            origin_country: order.originCountry,
            origin_phone: order.originPhone,
            origin_email: order.originEmail,
            dest_company: order.receiverName,
            dest_address: order.destAddress,
            dest_city: order.destCity,
            dest_zip: order.destZip,
            dest_country: order.destinationCountry,
            dest_contact: order.destContact,
            dest_phone: order.destPhone,
            dest_email: order.destEmail,
            weight: order.totalWeight,
            currencyCode: order.currency,
            invoice_date: order.createdAt
        }, order.bookingId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${filename}`);
        res.send(buffer);
    } catch (error) {
        console.error('Dynamic Invoice Serve Error:', error);
        res.status(500).send('Error generating invoice');
    }
};

