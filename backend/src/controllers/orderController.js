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

        // Generate invoice if not exists
        if (!order.invoiceUrl) {
            console.log(`[OrderController] Generating missing invoice for order: ${order.bookingId}`);
            const fileName = await invoiceGenerator.generateProformaInvoice({
                ...order.toJSON(),
                origin_company: order.shipperName,
                dest_company: order.receiverName,
                origin_country: order.originCountry,
                dest_country: order.destinationCountry,
                weight: order.totalWeight,
                currencyCode: order.currency,
                hawb: order.awb,
                invoice_date: order.createdAt
            }, order.bookingId);

            const invoiceUrl = `/invoices/${fileName}`;
            order.invoiceUrl = invoiceUrl;
            await order.save();

            // Also ensure ProformaInvoice record exists
            const invoice = await ProformaInvoice.findOne({ where: { orderId: order.id } });
            if (invoice) {
                invoice.invoiceUrl = invoiceUrl;
                await invoice.save();
            } else {
                await ProformaInvoice.create({
                    orderId: order.id,
                    invoiceNumber: order.invoice_number || `INV-${order.bookingId}`,
                    totalAmount: order.totalShippingPrice,
                    baseAmount: order.baseShippingPrice,
                    currency: order.currency,
                    invoiceUrl: invoiceUrl,
                    status: 'Generated'
                });
            }
        }

        res.json({
            success: true,
            invoiceUrl: order.invoiceUrl
        });
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
            dest_company: order.receiverName,
            origin_country: order.originCountry,
            dest_country: order.destinationCountry,
            weight: order.totalWeight,
            currencyCode: order.invoice?.currency || order.currency,
            totalShippingPrice: order.invoice?.totalAmount || order.totalShippingPrice,
            baseShippingPrice: order.invoice?.baseAmount || order.baseShippingPrice,
            hawb: order.awb,
            invoice_date: order.createdAt
        }, order.bookingId);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Admin HTML Invoice Error:', error.message);
        res.status(500).send(`<h1>Error generating invoice preview</h1><p>${error.message}</p>`);
    }
};
