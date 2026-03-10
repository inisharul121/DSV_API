const Order = require('../models/Order');
const ProformaInvoice = require('../models/ProformaInvoice');
const invoiceGenerator = require('../utils/invoiceGenerator');

// GET /api/customer/orders — returns only orders belonging to the logged-in customer
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customerId: req.customerId },
            include: [{ model: ProformaInvoice, as: 'invoice' }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Customer Orders Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.generateMyOrderInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({
            where: { id, customerId: req.customerId },
            include: [{ model: ProformaInvoice, as: 'invoice' }]
        });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        console.log(`[CustomerOrderController] Streaming invoice for order: ${order.bookingId}`);

        const doc = invoiceGenerator.generateProformaInvoice({
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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=proforma-${order.bookingId}.pdf`);

        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('Customer Invoice Generation Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getMyOrderInvoiceHTML = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({
            where: { id, customerId: req.customerId },
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
        console.error('Customer HTML Invoice Error:', error.message);
        res.status(500).send(`<h1>Error generating invoice preview</h1><p>${error.message}</p>`);
    }
};
