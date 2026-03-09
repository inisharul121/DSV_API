const Order = require('../models/Order');
const invoiceGenerator = require('../utils/invoiceGenerator');

// GET /api/customer/orders — returns only orders belonging to the logged-in customer
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customerId: req.customerId },
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
            where: { id, customerId: req.customerId }
        });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Generate invoice if not exists
        if (!order.invoiceUrl) {
            console.log(`[CustomerOrderController] Generating missing invoice for order: ${order.bookingId}`);

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
            order.invoiceUrl = `/invoices/${fileName}`;
            await order.save();
        }

        res.json({
            success: true,
            invoiceUrl: order.invoiceUrl
        });
    } catch (error) {
        console.error('Customer Invoice Generation Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
