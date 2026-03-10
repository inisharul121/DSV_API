const PDFDocument = require('pdfkit');

/**
 * Generates a Proforma Invoice PDF as a Buffer.
 * This is more reliable for Vercel Serverless Functions.
 */
exports.generateProformaInvoiceBuffer = (data, bookingId) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- HEADER ---
            doc.font('Helvetica-Bold').fontSize(18).text('DSV Global Transport', 40, 40);
            doc.font('Helvetica').fontSize(9).text('Professional Logistics Solutions', 40, 60);

            doc.fontSize(24).font('Helvetica-Bold').text('DSV', 450, 40, { align: 'right', width: 100 });
            doc.fontSize(8).font('Helvetica').text('Global Transport and Logistics', 450, 65, { align: 'right', width: 100 });

            // --- TITLE BLOCK ---
            doc.rect(40, 150, 515, 25).stroke();
            doc.font('Helvetica-Bold').fontSize(16).text('PRO FORMA TAX INVOICE', 45, 157);

            // --- SHIPMENT SPECIFICS ---
            const gridTop = 195;
            doc.rect(40, gridTop, 255, 30).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNOR', 45, gridTop + 3);
            doc.font('Helvetica').fontSize(9).text(data.origin_company || data.shipperName || "EFI CRETAPRINT", 45, gridTop + 14);

            doc.rect(295, gridTop, 260, 30).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNEE', 300, gridTop + 3);
            doc.font('Helvetica').fontSize(9).text(data.dest_company || data.receiverName || "METRO CITY TILES", 300, gridTop + 14);

            // Right Info Grid
            const invoiceDate = data.invoice_date ? new Date(data.invoice_date) : new Date();
            const formattedInvoiceDate = invoiceDate.toLocaleDateString('en-GB');

            const infoLabels = ['DATE', 'SHIPMENT', 'TERMS'];
            const infoValues = [formattedInvoiceDate, bookingId, data.incoterms || 'DAP'];

            infoLabels.forEach((label, i) => {
                const y = 195 + (i * 15);
                doc.rect(340, y, 90, 15).stroke();
                doc.rect(430, y, 125, 15).stroke();
                doc.font('Helvetica-Bold').fontSize(7).text(label, 345, y + 4, { width: 80, align: 'right' });
                doc.font('Helvetica').fontSize(8).text(infoValues[i], 435, y + 4);
            });

            // Totals
            const totalShippingPrice = parseFloat(data.totalShippingPrice || 0);
            const curr = data.currencyCode || data.currency || 'CHF';

            doc.moveDown(15);
            doc.font('Helvetica-Bold').fontSize(12).text(`TOTAL ${curr}: ${totalShippingPrice.toLocaleString()}`, 40, 600);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Returns a simple HTML preview.
 */
exports.generateProformaInvoiceHTML = (data, bookingId) => {
    const total = parseFloat(data.totalShippingPrice || 0);
    const curr = data.currencyCode || data.currency || 'CHF';

    return `
    <html>
    <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
        <h1 style="color: #002e6e;">Proforma Invoice</h1>
        <p><strong>Shipment:</strong> ${bookingId}</p>
        <p><strong>Shipper:</strong> ${data.shipperName || 'N/A'}</p>
        <p><strong>Receiver:</strong> ${data.receiverName || 'N/A'}</p>
        <hr>
        <h2 style="color: #e65100;">Total Amount: ${total.toLocaleString()} ${curr}</h2>
    </body>
    </html>`;
};
