const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

/**
 * Generates a high-fidelity professional Proforma Tax Invoice PDF.
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

            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- HEADER ---
            // Branding Section
            doc.font('Helvetica-Bold').fontSize(18).text('DSV Air & Sea Pvt. Ltd.', 40, 40);
            doc.font('Helvetica').fontSize(9).text('The Qube, B-201, B-204, M.V. Road', 40, 60);
            doc.text('Off Intl. Airport App. Road, Marol, Andheri East', 40, 72);
            doc.text('Mumbai 400 059, India', 40, 84);
            doc.text('Phone: +91 22 7199 9000    www.in.dsv.com', 40, 96);
            doc.text('Fax: +91 22 7199 9001      info@in.dsv.com', 40, 108);
            doc.fontSize(7).text('Business Reg No/CIN: U63011MH2006PTC162700', 40, 122);
            doc.text('Income Tax No (PAN): AACCD3848A', 40, 130);

            // Logo Branding Placeholder (Top Right)
            doc.fontSize(24).font('Helvetica-Bold').text('DSV', 450, 40, { align: 'right', width: 100 });
            doc.fontSize(8).font('Helvetica').text('Global Transport and Logistics', 450, 65, { align: 'right', width: 100 });

            // --- TITLE BLOCK ---
            doc.rect(40, 150, 515, 25).stroke();
            doc.font('Helvetica-Bold').fontSize(16).text('PRO FORMA TAX INVOICE IN', 45, 157);
            doc.fontSize(10).text('Page 1 of 1', 480, 158);

            // Registrations
            doc.font('Helvetica').fontSize(9).text('Service Tax Registration No: AACCD3848AST001', 40, 180);

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
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#000').text('DESCRIPTION', 45, tableTop + 4);
            doc.text('SERVICE TAX IN INR', 350, tableTop + 4, { width: 100, align: 'right' });
            doc.text('CHARGES IN INR', 450, tableTop + 4, { width: 100, align: 'right' });

            // Mocked Itemized Charges
            const goodsValue = parseFloat(data.goodsValue || 0);
            const freightCharge = goodsValue * 0.15 || 460169.18;
            const serviceTax = freightCharge * 0.14 || 64423.68;
            const sbTax = freightCharge * 0.005 || 2300.85;
            const subtotal = freightCharge;
            const total = subtotal + serviceTax + sbTax;

            doc.moveDown();
            const chargeY = doc.y;
            doc.font('Helvetica').fontSize(8);
            doc.text(`Freight Charge (Booking ${bookingId})`, 45, chargeY);
            doc.text('Zero Rated', 350, chargeY, { width: 100, align: 'right' });
            doc.text(freightCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, chargeY, { width: 100, align: 'right' });

            // Totals Box
            const totalBoxTop = 600;
            doc.rect(340, totalBoxTop, 215, 60).stroke();
            doc.moveTo(340, totalBoxTop + 15).lineTo(555, totalBoxTop + 15).stroke();
            doc.moveTo(340, totalBoxTop + 30).lineTo(555, totalBoxTop + 30).stroke();
            doc.moveTo(340, totalBoxTop + 45).lineTo(555, totalBoxTop + 45).stroke();

            doc.font('Helvetica-Bold').fontSize(8);
            doc.text('SUBTOTAL', 345, totalBoxTop + 4, { width: 100, align: 'right' });
            doc.text('SERVICE TAX 14.00%', 345, totalBoxTop + 19, { width: 100, align: 'right' });
            doc.text('SBC 0.50%', 345, totalBoxTop + 34, { width: 100, align: 'right' });
            doc.fontSize(10).text('TOTAL INR', 345, totalBoxTop + 49, { width: 100, align: 'right' });

            doc.font('Helvetica').fontSize(8);
            doc.text(subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, totalBoxTop + 4, { width: 100, align: 'right' });
            doc.text(serviceTax.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, totalBoxTop + 19, { width: 100, align: 'right' });
            doc.text(sbTax.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, totalBoxTop + 34, { width: 100, align: 'right' });
            doc.font('Helvetica-Bold').fontSize(10).text(total.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, totalBoxTop + 49, { width: 100, align: 'right' });

            // --- BANK TRANSFER FOOTER ---
            const footerTop = 680;
            doc.rect(25, footerTop, 290, 80).stroke();
            doc.rect(315, footerTop, 260, 80).stroke();

            doc.font('Helvetica-Bold').fontSize(8).text('Transfer Funds To:', 30, footerTop + 5);
            doc.font('Helvetica').text('Bank:', 30, footerTop + 20);
            doc.text('HSBC Limited', 80, footerTop + 20);
            doc.text('Account:', 30, footerTop + 35);
            doc.text(data.bankAccount || '030-773626-511', 80, footerTop + 35);
            doc.text('SWIFT:', 200, footerTop + 20);
            doc.text('HSBCINBB', 240, footerTop + 20);
            doc.font('Helvetica-Bold').text('Pay Ref:', 30, footerTop + 60);
            doc.text(`${data.customerId || '6402432396'} IN`, 80, footerTop + 60);

            doc.font('Helvetica-Bold').text('Address:', 320, footerTop + 5);
            doc.font('Helvetica').fontSize(8).text('DSV Air & Sea Pvt. Ltd. - I721\n8th Fl Off No A/6 & Unit No A2 Saf\nSatellite, Ahmedabad GJ 380051\nIndia', 320, footerTop + 20);

            doc.end();

            stream.on('finish', () => resolve(fileName));
            stream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
};
