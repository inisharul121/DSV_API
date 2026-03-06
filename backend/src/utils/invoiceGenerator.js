const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

/**
 * Generates a professional Proforma Invoice PDF.
 * 
 * @param {Object} data - The shipment data from the frontend.
 * @param {string} bookingId - The DSV Booking/Shipment ID.
 * @returns {Promise<string>} - The filename of the generated PDF.
 */
exports.generateProformaInvoice = async (data, bookingId) => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `proforma-${bookingId}.pdf`;
            const filePath = path.join(config.paths.invoices, fileName);

            // Ensure directory exists
            if (!fs.existsSync(config.paths.invoices)) {
                fs.mkdirSync(config.paths.invoices, { recursive: true });
            }

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('PROFORMA INVOICE', { align: 'center' });
            doc.moveDown();

            // Invoice Info
            doc.fontSize(10);
            doc.text(`Invoice Number: ${data.invoice_number || 'N/A'}`, { align: 'right' });
            doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
            doc.text(`Shipment ID: ${bookingId}`, { align: 'right' });
            doc.moveDown();

            // Sender & Receiver
            const startY = doc.y;
            doc.text('FROM (Shipper):', 50, startY, { underline: true });
            doc.text(data.origin_company || data.pickup?.address?.companyName || 'Sender');
            doc.text(data.origin_address || data.pickup?.address?.addressLine1 || '');
            doc.text(`${data.origin_zip || ''} ${data.origin_city || ''}`);
            doc.text(data.origin_country || '');
            doc.text(`Contact: ${data.origin_contact || ''}`);
            doc.text(`Phone: ${data.origin_phone || ''}`);
            if (data.origin_eori) doc.text(`EORI: ${data.origin_eori}`);

            doc.text('TO (Consignee):', 300, startY, { underline: true });
            doc.text(data.dest_company || data.delivery?.companyName || 'Receiver');
            doc.text(data.dest_address || data.delivery?.addressLine1 || '');
            doc.text(`${data.dest_zip || ''} ${data.dest_city || ''}`);
            doc.text(data.dest_country || '');
            doc.text(`Contact: ${data.dest_contact || ''}`);
            doc.text(`Phone: ${data.dest_phone || ''}`);
            if (data.dest_eori) doc.text(`EORI: ${data.dest_eori}`);

            doc.moveDown(2);

            // Shipment Details
            doc.text(`Service: ${data.serviceCode || 'DSV Air Express'}`, 50);
            doc.text(`Incoterms: ${data.incoterms || 'DAP'}`, 50);
            doc.text(`Reason for Export: ${data.reasonForExport || 'Sale'}`, 50);
            if (data.iossNumber) doc.text(`IOSS Number: ${data.iossNumber}`, 50);
            doc.moveDown();

            // Table Header
            const tableTop = doc.y;
            doc.font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('HS Code', 200, tableTop);
            doc.text('Qty', 300, tableTop, { width: 40, align: 'right' });
            doc.text('Unit Price', 350, tableTop, { width: 70, align: 'right' });
            doc.text('Amount', 430, tableTop, { width: 100, align: 'right' });
            doc.moveDown();
            doc.font('Helvetica');

            // Table Body (Single line for now as per current simple booking)
            const rowY = doc.y;
            const quantity = parseInt(data.quantity) || 1;
            const unitPrice = parseFloat(data.unitPrice || data.goodsValue || 0);
            const total = (quantity * unitPrice).toFixed(2);
            const currency = data.commodity_currency || data.currencyCode || 'CHF';

            doc.text(data.commodity || 'General Goods', 50, rowY, { width: 140 });
            doc.text(data.hsCode || 'N/A', 200, rowY);
            doc.text(quantity.toString(), 300, rowY, { width: 40, align: 'right' });
            doc.text(`${unitPrice.toFixed(2)} ${currency}`, 350, rowY, { width: 70, align: 'right' });
            doc.text(`${total} ${currency}`, 430, rowY, { width: 100, align: 'right' });

            doc.moveDown(2);

            // Totals
            doc.font('Helvetica-Bold');
            doc.text(`TOTAL VALUE: ${total} ${currency}`, { align: 'right' });
            doc.moveDown();

            // Signature
            doc.font('Helvetica');
            doc.text('Declaration:', 50);
            doc.fontSize(8).text('I declare that the information on this invoice is true and correct and that the contents of this shipment are as stated above.', 50);
            doc.moveDown();
            doc.fontSize(10).text(`Authorized Signature: ${data.invoice_signature || data.origin_contact || 'Sender'}`, 50);
            doc.text(`Title/Role: Manager`, 50);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 50);

            doc.end();

            stream.on('finish', () => resolve(fileName));
            stream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
};
