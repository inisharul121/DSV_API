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
 * Returns a professional HTML proforma invoice matching the provided spec.
 */
exports.generateProformaInvoiceHTML = (data, bookingId) => {
    const totalAmount = parseFloat(data.goodsValue || 0);
    const curr = data.commodity_currency || data.currencyCode || data.currency || 'USD';
    const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const awb = data.awb || bookingId || 'N/A';

    // Address helper
    const getAddress = (prefix) => {
        const company = data[`${prefix}_company`] || 'N/A';
        const address = data[`${prefix}_address`] || '';
        const city = data[`${prefix}_city`] || '';
        const zip = data[`${prefix}_zip`] || '';
        const country = data[`${prefix}_country`] || '';
        return `<strong>${company}</strong><br>${address}<br>${city} ${zip}. ${country}`;
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; padding: 20px; }
            .container { width: 800px; margin: 0 auto; }
            .header { position: relative; margin-bottom: 40px; }
            .title { text-align: center; font-size: 28px; font-weight: bold; margin-left: 200px; }
            
            .row { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .col { flex: 1; }
            
            .section-label { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .address-box { font-size: 13px; margin-bottom: 20px; }
            
            .info-table { width: 350px; border-collapse: collapse; margin-left: auto; }
            .info-table td { padding: 4px 0; border-bottom: 1px solid #333; font-size: 13px; }
            .info-table td:first-child { font-weight: bold; width: 150px; }
            
            .contact-info { font-size: 13px; margin-top: 10px; }
            
            .goods-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .goods-table th { text-align: left; font-size: 12px; border-bottom: 1px solid #333; padding-bottom: 10px; }
            .goods-table td { padding: 15px 0; font-size: 13px; vertical-align: top; }
            
            .summary { margin-left: auto; width: 350px; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .summary-total { font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
            
            .footer-info { font-size: 12px; margin-top: 40px; }
            .certification { font-size: 12px; font-style: italic; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="title">Proforma Invoice</div>
            </div>

            <div class="row">
                <div class="col">
                    <div class="section-label">Sender:</div>
                    <div class="address-box">${getAddress('origin')}</div>

                    <div class="section-label" style="margin-top:20px">Pickup Point:</div>
                    <div class="address-box">${getAddress('pickup')}</div>

                    <div class="section-label">Receiver:</div>
                    <div class="address-box">${getAddress('dest')}</div>
                </div>

                <div class="col">
                    <table class="info-table">
                        <tr><td>Date:</td><td>${date}</td></tr>
                        <tr><td>Air Waybill:</td><td>${awb}</td></tr>
                        <tr><td>Proforma Invoice Number:</td><td>${data.invoice_number || 'N/A'}</td></tr>
                        <tr><td>Shipment Reference:</td><td>${data.ref_value || 'N/A'}</td></tr>
                        <tr><td colspan="2" style="border:none; padding-top:15px">Total Box Dimensions:</td></tr>
                        <tr><td colspan="2" style="border:none; font-weight:normal">${data.quantity || 1} X Box: H*L*W (${data.height || 0}*${data.length || 0}*${data.width || 0})</td></tr>
                    </table>
                </div>
            </div>

            <div class="row" style="margin-top: 40px;">
                <div class="col">
                    <div class="section-label">Sender contact:</div>
                    <div class="contact-info">
                        Name: ${data.origin_contact || 'N/A'}<br>
                        Phone: ${data.origin_phone || 'N/A'}<br>
                        E-Mail: ${data.origin_email || 'N/A'}
                    </div>
                </div>
            </div>

            <table class="goods-table">
                <thead>
                    <tr>
                        <th width="35%">Full Description of Goods</th>
                        <th width="15%">HS code</th>
                        <th width="15%">Country of Origin</th>
                        <th width="10%">Net Weight</th>
                        <th width="5%">Qty.</th>
                        <th width="10%">Unit Value</th>
                        <th width="10%" style="text-align:right">Subtotal Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${data.commodity || 'General Goods'}</td>
                        <td>${data.hsCode || 'N/A'}</td>
                        <td>${data.commodity_origin || data.origin_country || 'N/A'}</td>
                        <td>${data.netWeight || data.weight || 0} Kg</td>
                        <td>${data.quantity || 1}</td>
                        <td>${data.unitPrice || data.goodsValue || 0}</td>
                        <td style="text-align:right">$${totalAmount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="summary">
                <div class="summary-row summary-total">
                    <span>Total Declared Value:</span>
                    <span>$${totalAmount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Total Net Weight:</span>
                    <span>${data.netWeight || data.weight || 0} Kg</span>
                </div>
                <div class="summary-row">
                    <span>Total Gross Weight:</span>
                    <span>${data.weight || 0} Kg</span>
                </div>
                <div class="summary-row">
                    <span>Total Packages:</span>
                    <span>1 Box (${data.height || 0}*${data.length || 0}*${data.width || 0})</span>
                </div>
            </div>

            <div class="footer-info">
                <p>Type of Export: Standard Air freight &nbsp;&nbsp;&nbsp;&nbsp; Currency Code: ${curr}</p>
                <p>Reason Export: ${data.reasonForExport || 'promotional purpose only. Not for Sale.'}</p>
            </div>

            <div class="certification">
                We hereby certify that the Information on this Invoice is true and correct and the contents of this shipment are as stated above.
            </div>
        </div>
    </body>
    </html>`;
};
