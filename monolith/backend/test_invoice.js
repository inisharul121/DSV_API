const Order = require('./src/models/Order');
const invoiceGenerator = require('./src/utils/invoiceGenerator');

async function test() {
    try {
        const bookingId = '14621714';
        const order = await Order.findOne({ where: { bookingId } });

        if (!order) {
            console.log('Order not found');
            return;
        }

        console.log('Found order:', order.bookingId, 'Currency:', order.currency);

        const shipmentData = {
            ...order.toJSON(),
            origin_company: order.shipperName,
            dest_company: order.receiverName,
            origin_country: order.originCountry,
            dest_country: order.destinationCountry,
            weight: order.totalWeight,
            currencyCode: order.currency || 'CHF',
            hawb: order.awb,
            invoice_date: order.createdAt
        };

        console.log('Generating refined invoice...');
        const fileName = await invoiceGenerator.generateProformaInvoice(shipmentData, order.bookingId);
        console.log('Generated:', fileName);

        order.invoiceUrl = `/invoices/${fileName}`;
        await order.save();
        console.log('Success!');
    } catch (error) {
        console.error('DIAGNOSTIC ERROR:', error);
    } finally {
        process.exit();
    }
}

test();
