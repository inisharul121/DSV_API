const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

/**
 * Generates a high-fidelity professional Proforma Tax Invoice PDF.
 */
/**
 * Generates a high-fidelity professional Proforma Tax Invoice PDF.
 * Returns the PDFDocument instance for streaming.
 */
exports.generateProformaInvoice = (data, bookingId) => {
    try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        // --- HEADER ---
        // Branding Section
        doc.font('Helvetica-Bold').fontSize(18).text('DSV Global Transport', 40, 40);
        doc.font('Helvetica').fontSize(9).text('Professional Logistics Solutions', 40, 60);
        doc.text('Global Network | Air & Sea | Solutions', 40, 72);
        doc.text('www.dsv.com', 40, 84);

        // Logo Branding Placeholder (Top Right)
        doc.fontSize(24).font('Helvetica-Bold').text('DSV', 450, 40, { align: 'right', width: 100 });
        doc.fontSize(8).font('Helvetica').text('Global Transport and Logistics', 450, 65, { align: 'right', width: 100 });

        // --- TITLE BLOCK ---
        doc.rect(40, 150, 515, 25).stroke();
        doc.font('Helvetica-Bold').fontSize(16).text('PRO FORMA TAX INVOICE', 45, 157);
        doc.fontSize(10).text('Page 1 of 1', 480, 158);

        // --- SHIPMENT SPECIFICS (GRID) ---
        const gridTop = 195;
        const gridWidth = 190;
        const gridHeight = 15;

        // Consignor Box
        doc.rect(40, gridTop, 255, 30).stroke();
        doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNOR', 45, gridTop + 3);
        doc.font('Helvetica').fontSize(9).text(data.origin_company || "EFI CRETAPRINT S.L.U.", 45, gridTop + 14);

        // Consignee Box
        doc.rect(295, gridTop, 260, 30).stroke();
        doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNEE', 300, gridTop + 3);
        doc.font('Helvetica').fontSize(9).text(data.dest_company || "METRO CITY TILES PVT LTD.", 300, gridTop + 14);

        // Right Info Grid
        const invoiceDate = data.invoice_date ? new Date(data.invoice_date) : new Date();
        const formattedInvoiceDate = invoiceDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

        const infoLabels = ['INVOICE DATE', 'CUSTOMER ID', 'SHIPMENT', 'DUE DATE', 'TERMS'];
        const infoValues = [
            formattedInvoiceDate,
            data.customerId ? data.customerId.substring(0, 10) : 'TBA',
            bookingId,
            new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
            data.incoterms || 'DAP'
        ];

        infoLabels.forEach((label, i) => {
            const y = 195 + (i * 15);
            doc.rect(340, y, 90, 15).stroke();
            doc.rect(430, y, 125, 15).stroke();
            doc.font('Helvetica-Bold').fontSize(7).text(label, 345, y + 4, { width: 80, align: 'right' });
            doc.font('Helvetica').fontSize(8).text(infoValues[i], 435, y + 4);
        });

        // Consol Number
        doc.rect(340, 275, 90, 15).stroke();
        doc.rect(430, 275, 125, 15).stroke();
        doc.font('Helvetica-Bold').fontSize(7).text('CONSOL NUMBER', 345, 279, { width: 80, align: 'right' });
        doc.font('Helvetica').fontSize(8).text(data.consolNumber || 'TBS', 435, 279);

        // --- SHIPMENT DETAILS SECTION ---
        doc.font('Helvetica-Bold').fontSize(8).text('SHIPMENT DETAILS', 40, 300);
        doc.font('Helvetica').fontSize(8).text(`PRINTED BY: ${data.printedBy || 'Limber System'}`, 480, 300);

        // Grid Part 2
        doc.rect(40, 310, 515, 140).stroke(); // Outer box
        doc.moveTo(40, 330).lineTo(555, 330).stroke(); // Goods description separator
        doc.moveTo(40, 360).lineTo(555, 360).stroke(); // Weight/Vol separator
        doc.moveTo(40, 400).lineTo(555, 400).stroke(); // Flight separator
        doc.moveTo(40, 430).lineTo(555, 430).stroke(); // Origin/ETD separator

        // Column separators for Weight/Vol
        doc.moveTo(190, 360).lineTo(190, 400).stroke();
        doc.moveTo(280, 360).lineTo(280, 400).stroke();
        doc.moveTo(380, 360).lineTo(380, 400).stroke();
        doc.moveTo(460, 360).lineTo(460, 400).stroke();

        // Column separators for Flight
        doc.moveTo(410, 400).lineTo(410, 430).stroke();

        // Labels for Shipment Details
        doc.font('Helvetica-Bold').fontSize(7);
        doc.text('GOODS DESCRIPTION', 45, 313);
        doc.text('ORDER NUMBERS / OWNER\'S REFERENCE', 45, 333);

        doc.text('IMPORT CUSTOMS BROKER', 45, 363);
        doc.text('WEIGHT', 195, 363);
        doc.text('VOLUME', 285, 363);
        doc.text('CHARGEABLE', 385, 363);
        doc.text('PACKAGES', 465, 363);

        doc.text('FLIGHT / DATE & REFERENCE', 45, 403);
        doc.text('MAWB', 415, 403);
        doc.text('HAWB', 485, 403);

        doc.text('ORIGIN', 45, 433);
        doc.text('ETD', 240, 433);
        doc.text('DESTINATION', 305, 433);
        doc.text('ETA', 485, 433);

        // Data for Shipment Details
        doc.font('Helvetica').fontSize(8);
        doc.text(data.commodity || data.reasonForExport || 'GENERAL CARGO', 45, 321);
        doc.text(data.orderRef || 'LIMBER-' + bookingId, 45, 345);

        doc.text(data.weight ? `${data.weight} KG` : '0.00 KG', 195, 375);
        doc.text(data.volume ? `${data.volume} M3` : '0.00 M3', 285, 375);
        doc.text(data.chargeableWeight ? `${data.chargeableWeight} KG` : (data.weight ? `${data.weight} KG` : '0.00 KG'), 385, 375);
        doc.text(data.quantity ? `${data.quantity} PCS` : '1 PCS', 465, 375);

        doc.text(`${data.flightNo || 'TBS'} / ${formattedInvoiceDate} / ${bookingId}`, 45, 415);
        doc.text(data.mawb || 'TBS', 415, 415);
        doc.text(data.hawb || data.awb || 'TBS', 485, 415);

        const origin = data.origin_city ? `${data.origin_city}, ${data.origin_country}` : data.originCountry;
        const dest = data.dest_city ? `${data.dest_city}, ${data.dest_country}` : data.destinationCountry;

        doc.text(origin || 'TBS', 45, 442);
        doc.text(formattedInvoiceDate, 240, 442);
        doc.text(dest || 'TBS', 305, 442);
        doc.text(formattedInvoiceDate, 485, 442);

        // --- CHARGES SECTION ---
        doc.moveDown(4);
        const tableTop = 470;
        doc.rect(40, tableTop, 515, 15).fill('#f1f5f9').stroke();
        const curr = data.currencyCode || 'CHF';
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#000').text('DESCRIPTION', 45, tableTop + 4);
        doc.text(`TAX IN ${curr}`, 350, tableTop + 4, { width: 100, align: 'right' });
        doc.text(`CHARGES IN ${curr}`, 450, tableTop + 4, { width: 100, align: 'right' });

        // Dynamic Pricing Logic
        const totalShippingPrice = parseFloat(data.totalShippingPrice || 0);
        const baseShippingPrice = parseFloat(data.baseShippingPrice || 0);

        let freightCharge, serviceTax, sbTax, subtotal, total;

        if (totalShippingPrice > 0) {
            // Use the real prices from the database
            freightCharge = baseShippingPrice;
            serviceTax = 0; // Defaulting to 0 if not explicitly stored, or calculate as difference
            sbTax = totalShippingPrice - baseShippingPrice; // Handling fee / Tax
            subtotal = baseShippingPrice;
            total = totalShippingPrice;
        } else {
            // Fallback to dummy calculations (legacy/mock logic)
            const goodsValue = parseFloat(data.goodsValue || 0);
            freightCharge = goodsValue * 0.15 || 460169.18;
            serviceTax = freightCharge * 0.14 || 64423.68;
            sbTax = freightCharge * 0.005 || 2300.85;
            subtotal = freightCharge;
            total = subtotal + serviceTax + sbTax;
        }

        doc.moveDown();
        const chargeY = doc.y;
        doc.font('Helvetica').fontSize(8);
        doc.text(totalShippingPrice > 0 ? `Shipping & Handling (Booking ${bookingId})` : `Freight Charge (Booking ${bookingId})`, 45, chargeY);
        doc.text(totalShippingPrice > 0 ? 'Included' : 'Zero Rated', 350, chargeY, { width: 100, align: 'right' });
        doc.text(freightCharge.toLocaleString('en-US', { minimumFractionDigits: 2 }), 450, chargeY, { width: 100, align: 'right' });

        // Totals Box
        const totalBoxTop = 600;
        doc.rect(340, totalBoxTop, 215, 60).stroke();
        doc.moveTo(340, totalBoxTop + 15).lineTo(555, totalBoxTop + 15).stroke();
        doc.moveTo(340, totalBoxTop + 30).lineTo(555, totalBoxTop + 30).stroke();
        doc.moveTo(340, totalBoxTop + 45).lineTo(555, totalBoxTop + 45).stroke();

        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('SUBTOTAL', 345, totalBoxTop + 4, { width: 100, align: 'right' });
        doc.text('VAT / TAX', 345, totalBoxTop + 19, { width: 100, align: 'right' });
        doc.text('OTHER FEES', 345, totalBoxTop + 34, { width: 100, align: 'right' });
        doc.fontSize(10).text(`TOTAL ${curr}`, 345, totalBoxTop + 49, { width: 100, align: 'right' });

        doc.font('Helvetica').fontSize(8);
        doc.text(subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }), 450, totalBoxTop + 4, { width: 100, align: 'right' });
        doc.text(serviceTax.toLocaleString('en-US', { minimumFractionDigits: 2 }), 450, totalBoxTop + 19, { width: 100, align: 'right' });
        doc.text(sbTax.toLocaleString('en-US', { minimumFractionDigits: 2 }), 450, totalBoxTop + 34, { width: 100, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(10).text(total.toLocaleString('en-US', { minimumFractionDigits: 2 }), 450, totalBoxTop + 49, { width: 100, align: 'right' });

        // --- BANK TRANSFER FOOTER ---
        const footerTop = 680;
        doc.rect(25, footerTop, 290, 80).stroke();
        doc.rect(315, footerTop, 260, 80).stroke();

        doc.font('Helvetica-Bold').fontSize(8).text('Transfer Funds To:', 30, footerTop + 5);
        doc.font('Helvetica').text('Bank:', 30, footerTop + 20);
        doc.text(data.bankName || 'International Bank', 80, footerTop + 20);
        doc.text('Account:', 30, footerTop + 35);
        doc.text(data.bankAccount || 'CH-XXXX-XXXX-XXXX', 80, footerTop + 35);
        doc.text('SWIFT:', 200, footerTop + 20);
        doc.text(data.bankSwift || 'BANKXXXX', 240, footerTop + 20);
        doc.font('Helvetica-Bold').text('Pay Ref:', 30, footerTop + 60);
        doc.text(`${bookingId} / ${data.receiverName || 'REF'}`, 80, footerTop + 60);

        doc.font('Helvetica-Bold').text('Address:', 320, footerTop + 5);
        doc.font('Helvetica').fontSize(8).text('DSV Global Transport and Logistics\nGlobal Network Offices\nLogistics Hub\nInternational Network', 320, footerTop + 20);

        return doc;

    } catch (error) {
        throw error;
    }
};

/**
 * Generates the HTML string for the Proforma Invoice.
 */
exports.generateProformaInvoiceHTML = (data, bookingId) => {
    const invoiceDate = data.invoice_date ? new Date(data.invoice_date) : new Date();
    const formattedInvoiceDate = invoiceDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    const dueDate = new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    const curr = data.currencyCode || 'CHF';

    // Dynamic Pricing Logic
    const totalShippingPrice = parseFloat(data.totalShippingPrice || 0);
    const baseShippingPrice = parseFloat(data.baseShippingPrice || 0);

    let freightCharge, serviceTax, sbTax, subtotal, total;

    if (totalShippingPrice > 0) {
        freightCharge = baseShippingPrice;
        serviceTax = 0;
        sbTax = totalShippingPrice - baseShippingPrice;
        subtotal = baseShippingPrice;
        total = totalShippingPrice;
    } else {
        const goodsValue = parseFloat(data.goodsValue || 0);
        freightCharge = goodsValue * 0.15 || 460.16;
        serviceTax = freightCharge * 0.14 || 64.42;
        sbTax = freightCharge * 0.005 || 2.30;
        subtotal = freightCharge;
        total = subtotal + serviceTax + sbTax;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            :root { --primary: #002e6e; --accent: #e65100; --text: #1e293b; --muted: #64748b; --border: #e2e8f0; --bg-light: #f8fafc; }
            body { font-family: 'Inter', system-ui, sans-serif; color: var(--text); padding: 40px; background: #f1f5f9; display: flex; justify-content: center; }
            .invoice-container { width: 800px; background: white; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; }
            header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .brand-info h1 { color: var(--primary); margin: 0; font-size: 24px; font-weight: 800; }
            .brand-info p { margin: 4px 0; font-size: 12px; color: var(--muted); }
            .logo-box { text-align: right; }
            .logo-box .dsv-logo { font-size: 32px; font-weight: 900; color: var(--primary); }
            .title-block { border: 1px solid var(--text); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .title-block h2 { margin: 0; font-size: 20px; text-transform: uppercase; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; }
            .address-box { border: 1px solid var(--border); padding: 15px; }
            .label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .address-box p { margin: 0; font-size: 13px; font-weight: 600; }
            .info-grid { margin-top: -30px; margin-left: auto; width: 300px; display: grid; grid-template-columns: 120px 180px; }
            .info-cell { padding: 6px 12px; border: 1px solid var(--border); font-size: 11px; }
            .info-cell.label-cell { text-align: right; font-weight: 700; background: var(--bg-light); color: var(--muted); }
            .info-cell.value-cell { font-weight: 600; }
            .details-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); margin-top: 20px; }
            .details-table td { border: 1px solid var(--border); padding: 10px; }
            .sub-label { font-size: 9px; font-weight: 800; color: var(--muted); text-transform: uppercase; display: block; }
            .sub-value { font-size: 12px; font-weight: 600; }
            .charges-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .charges-table th { background: var(--bg-light); text-align: left; padding: 10px; font-size: 11px; border-bottom: 1px solid var(--border); }
            .charges-table td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .text-right { text-align: right; }
            .totals-container { margin-top: 30px; margin-left: auto; width: 300px; border: 1px solid var(--border); }
            .total-row { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 700; }
            .total-row:last-child { background: var(--bg-light); font-size: 14px; color: var(--primary); }
            footer { margin-top: 50px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
            .footer-box { border: 1px solid var(--border); padding: 15px; font-size: 11px; }
            .footer-box h4 { margin: 0 0 10px 0; color: var(--primary); }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <header>
                <div class="brand-info">
                    <h1>DSV Global Transport</h1>
                    <p>Professional Logistics Solutions</p>
                </div>
                <div class="logo-box"><div class="dsv-logo">DSV</div></div>
            </header>
            <div class="title-block"><h2>PRO FORMA TAX INVOICE</h2></div>
            <div class="address-grid">
                <div class="address-box"><span class="label">CONSIGNOR</span><p>${data.origin_company || 'BCIC SWISS GmbH'}</p></div>
                <div class="address-box"><span class="label">CONSIGNEE</span><p>${data.dest_company || 'METRO CITY TILES PVT LTD.'}</p></div>
            </div>
            <div class="info-grid">
                <div class="info-cell label-cell">INVOICE DATE</div><div class="info-cell value-cell">${formattedInvoiceDate}</div>
                <div class="info-cell label-cell">SHIPMENT</div><div class="info-cell value-cell">${bookingId}</div>
                <div class="info-cell label-cell">TERMS</div><div class="info-cell value-cell">${data.incoterms || 'DAP'}</div>
            </div>
            <table class="details-table">
                <tr>
                    <td colspan="4"><span class="sub-label">GOODS DESCRIPTION</span><span class="sub-value">${data.commodity || 'GENERAL CARGO'}</span></td>
                    <td colspan="2"><span class="sub-label">WEIGHT</span><span class="sub-value">${data.weight || '0.00'} KG</span></td>
                </tr>
                <tr>
                    <td colspan="3"><span class="sub-label">PACKAGES</span><span class="sub-value">${data.quantity || '1'} PCS</span></td>
                    <td colspan="3"><span class="sub-label">HAWB</span><span class="sub-value">${data.hawb || 'TBS'}</span></td>
                </tr>
            </table>
            <table class="charges-table">
                <thead><tr><th>DESCRIPTION</th><th class="text-right">TAX</th><th class="text-right">CHARGES (${curr})</th></tr></thead>
                <tbody>
                    <tr><td>${totalShippingPrice > 0 ? 'Shipping & Handling' : 'Freight Charges'}</td><td class="text-right">${totalShippingPrice > 0 ? 'Included' : 'Zero Rated'}</td><td class="text-right">${freightCharge.toFixed(2)}</td></tr>
                    <tr><td>Service Tax (14%)</td><td class="text-right">${serviceTax.toFixed(2)}</td><td class="text-right">-</td></tr>
                </tbody>
            </table>
            <div class="totals-container">
                <div class="total-row"><span>SUBTOTAL</span><span>${subtotal.toFixed(2)}</span></div>
                <div class="total-row"><span>TOTAL ${curr}</span><span>${total.toFixed(2)}</span></div>
            </div>
            <footer>
                <div class="footer-box"><h4>Bank Details</h4><p>Bank: ${data.bankName || 'UBS Switzerland'}<br>Account: ${data.bankAccount || 'CH-XXXX'}</p></div>
                <div class="footer-box"><h4>Address</h4><p>DSV Global Transport<br>Zurich-Airport, CH</p></div>
            </footer>
        </div>
    </body>
    </html>`;
};
