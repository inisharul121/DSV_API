const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const dsvClient = require('../config/dsv-api');
const labelExtractor = require('../utils/labelExtractor');
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

        // 2. Fallback: Try serving from Filesystem (Local development)
        const filePath = path.join(config.paths.labels, filename);
        if (fs.existsSync(filePath)) {
            console.log(`[ServeLabel] Found physical file for ${filename}, serving from disk.`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${filename}`);
            return res.sendFile(filePath);
        }

        // 3. Self-Healing: Fetch from DSV if missing everywhere (Critical for Vercel/Railway persistence)
        console.log(`[ServeLabel] Label missing in DB and Disk for ${bookingId}. Attempting self-healing from DSV...`);
        
        // Try standard label paths
        const pathsToTry = [
            `${config.dsv.endpoints.booking}/v2/bookings/labels/${bookingId}?labelFormat=PDF`,
            `${config.dsv.endpoints.booking}/booking/v2/bookings/labels/${bookingId}?labelFormat=PDF`,
            `${config.dsv.endpoints.booking}/booking/v2/shipments/${bookingId}/labels?labelFormat=PDF`
        ];

        let labelContent = null;
        for (const url of pathsToTry) {
            try {
                const response = await dsvClient.get(url);
                labelContent = labelExtractor.extractLabelContent(response.data);
                if (labelContent) {
                    console.log(`[ServeLabel] Successfully re-fetched label from DSV: ${url}`);
                    break;
                }
            } catch (err) {
                // Silently continue to next path
            }
        }

        if (labelContent) {
            // Persist to DB for next time
            if (order) {
                await order.update({ labelData: labelContent });
                console.log(`[ServeLabel] Persisted re-fetched label to DB for ${bookingId}`);
            }
            
            const buffer = Buffer.from(labelContent, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${filename}`);
            return res.send(buffer);
        }

        console.warn(`[ServeLabel] Label NOT found for ${bookingId} in DB, Disk, or DSV API.`);
        res.status(404).send('<h1>Label Not Found</h1><p>The requested label could not be found in our records, on disk, or retrieved from the carrier.</p>');
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
        const { refresh } = req.query;
        const bookingId = filename.replace('proforma-', '').replace('.pdf', '');
        
        console.log(`[ServeInvoice] Requested: ${filename}, BookingID: ${bookingId}, Refresh: ${refresh === 'true'}`);

        const order = await Order.findOne({ where: { bookingId } });
        if (!order) {
            return res.status(404).send('<h1>Invoice Not Found</h1>');
        }

        // 1. Try serving from Database (unless refresh is requested)
        if (order.invoiceData && refresh !== 'true') {
            console.log(`[ServeInvoice] Found persistent invoice in DB for ${bookingId}`);
            const buffer = Buffer.from(order.invoiceData, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${filename}`);
            return res.send(buffer);
        }

        // 2. Generate/Refresh if missing or requested
        console.log(`[ServeInvoice] ${refresh === 'true' ? 'Refreshing' : 'Generating'} invoice for ${bookingId}...`);
        
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

        // Save to DB for future use
        await order.update({ invoiceData: buffer.toString('base64') });
        console.log(`[ServeInvoice] Persistent invoice saved to DB for ${bookingId}`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${filename}`);
        res.send(buffer);
    } catch (error) {
        console.error('Dynamic Invoice Serve Error:', error);
        res.status(500).send('Error generating invoice');
    }
};

