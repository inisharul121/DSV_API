const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// detect environment
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Invoices directory — resolved lazily so env vars are read at call time
const getInvoicesDir = () => {
    try {
        const config = require('../config/env');
        return config.paths.invoices;
    } catch {
        return path.resolve('./public/invoices');
    }
};

/**
 * Country code → Country name helper (expand as needed)
 */
const COUNTRY_NAMES = {
    CH: 'Switzerland',
    BD: 'Bangladesh',
    DE: 'Germany',
    GB: 'United Kingdom',
    US: 'United States',
    FR: 'France',
    IN: 'India',
    CN: 'China',
    AE: 'United Arab Emirates',
    SG: 'Singapore',
    NL: 'Netherlands',
    BE: 'Belgium',
    IT: 'Italy',
    AT: 'Austria',
    PL: 'Poland',
    SE: 'Sweden',
    DK: 'Denmark',
    NO: 'Norway',
    ES: 'Spain',
    PT: 'Portugal',
    CA: 'Canada',
    AU: 'Australia',
    NZ: 'New Zealand',
    JP: 'Japan',
    KR: 'South Korea',
    PK: 'Pakistan',
    LK: 'Sri Lanka',
    NP: 'Nepal',
    TR: 'Turkey',
    SA: 'Saudi Arabia',
    QA: 'Qatar',
    KW: 'Kuwait',
    BH: 'Bahrain',
    OM: 'Oman',
};

function countryName(code) {
    if (!code) return '';
    return COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase();
}

/**
 * Formats a date to a human-readable string, e.g. "March 11, 2026"
 */
function formatDate(date) {
    if (!date) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Renders the proforma invoice HTML template with all real order data.
 * Reads the template from /public/templates/proforma-invoice.html and replaces
 * every {{placeholder}} with data from the order/shipment object.
 */
exports.generateProformaInvoiceHTML = (data, bookingId) => {
    const templatePath = path.join(__dirname, '../../public/templates/proforma-invoice.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // ── Derived values ──────────────────────────────────────────────────────
    const curr = data.currency || data.currencyCode || data.commodity_currency || 'CHF';
    const invoiceDate = formatDate(data.invoice_date || data.createdAt);
    const totalShipping = parseFloat(data.totalShippingPrice || 0).toFixed(2);
    const baseShipping = parseFloat(data.baseShippingPrice || 0).toFixed(2);
    const goodsValue = parseFloat(data.goodsValue || data.unitPrice || 0).toFixed(2);
    const unitPrice = parseFloat(data.unitPrice || data.goodsValue || 0).toFixed(2);

    // ── Signer / responsible person ─────────────────────────────────────────
    const signerName = data.invoice_signature || data.origin_contact || 'Mazharul Sheikh';
    const signerPhone = data.origin_phone || '+41786195928';

    // ── Build the replacements map ───────────────────────────────────────────
    const replacements = {
        // Invoice meta
        invoiceNumber: data.invoice_number || data.invoiceNumber || 'N/A',
        invoiceDate,
        invoiceType: data.invoice_type || data.invoiceType || 'Proforma Invoice',
        bookingId: bookingId || data.bookingId || 'N/A',
        awb: data.awb || bookingId || 'N/A',

        // Signer
        signerName,
        signerPhone,

        // Origin / Shipper
        originCompany: data.origin_company || data.shipperName || 'Limber Cargo',
        originAddress: data.origin_address || 'Lättichstrasse 6',
        originCity: data.origin_city || 'Baar',
        originZip: data.origin_zip || '6340',
        originCountry: (data.origin_country || data.originCountry || 'CH').toUpperCase(),
        originCountryName: countryName(data.origin_country || data.originCountry || 'CH'),
        originContact: data.origin_contact || signerName,
        originPhone: data.origin_phone || signerPhone,
        originEmail: data.origin_email || '',
        originEori: data.origin_eori || '',
        pickupDate: data.pickup_date || invoiceDate,
        pickupInstructions: data.pickup_instructions || '',

        // Destination / Consignee
        destCompany: data.dest_company || data.receiverName || data.delivery?.companyName || 'N/A',
        destAddress: data.dest_address || data.delivery?.addressLine1 || '',
        destCity: data.dest_city || data.delivery?.city || '',
        destZip: data.dest_zip || data.delivery?.zipCode || '',
        destCountry: (data.dest_country || data.destinationCountry || data.delivery?.countryCode || '').toUpperCase(),
        destCountryName: countryName(data.dest_country || data.destinationCountry || data.delivery?.countryCode),
        destContact: data.dest_contact || data.delivery?.contactName || '',
        destPhone: data.dest_phone || data.delivery?.contactPhoneNumber || '',
        destEmail: data.dest_email || data.delivery?.email || '',
        destEori: data.dest_eori || '',

        // Payment status
        shippingCharges: data.paymentType || 'Sender',
        dutiesTaxes: data.dutiesType || 'Receiver',

        // Goods / Shipment
        commodity: data.commodity || 'Shipping Goods',
        hsCode: data.hsCode || data.hs_code || 'N/A',
        originOfGoods: data.originOfGoods || data.commodity_origin || (data.origin_country || data.originCountry || 'CH').toUpperCase(),
        quantity: data.quantity || 1,
        uom: data.uom || 'PCS',
        unitPrice: unitPrice, // Keep legacy for metadata if needed
        goodsValue: goodsValue, // Keep legacy for metadata if needed
        netWeight: data.netWeight || data.weight || 0,
        totalWeight: data.totalWeight || data.weight || 0,
        height: data.height || 0,
        length: data.length || 0,
        width: data.width || 0,

        // Export details
        reasonForExport: data.reasonForExport || 'Sale',
        incoterms: data.incoterms || 'DAP - Delivered at Place',
        serviceCode: data.serviceCode || 'N/A',
        iossNumber: data.iossNumber || '',

        // Financial
        currency: curr,
        baseShippingPrice: baseShipping,
        totalShippingPrice: totalShipping,
    };

    // ── Generate Dynamic Item Rows ──────────────────────────────────────────
    let itemRows = '';
    let items = data.items;

    // Safety: Parse stringified JSON if needed (common when coming from some DB layers)
    if (typeof items === 'string') {
        try {
            items = JSON.parse(items);
        } catch (e) {
            console.error('Failed to parse items string:', e);
            items = null;
        }
    }

    if (!items || !Array.isArray(items)) {
        items = [
            {
                description: data.commodity || 'Shipping Goods',
                hsCode: data.hsCode || data.hs_code || 'N/A',
                origin: data.originOfGoods || data.commodity_origin || (data.origin_country || data.originCountry || 'CH'),
                quantity: data.quantity || 1,
                uom: data.uom || 'PCS',
                unitPrice: data.unitPrice || data.goodsValue || 0,
                value: data.goodsValue || data.unitPrice || 0,
                netWeight: data.netWeight || data.weight || 0
            }
        ];
    }

    items.forEach(item => {
        // Strictly calculate total from unitPrice * quantity to avoid stale 'value' from frontend
        const price = parseFloat(item.unitPrice || 0);
        const qty = parseInt(item.quantity) || 1;
        const total = (price * qty).toFixed(2);
        const displayUnitPrice = price.toFixed(2);

        itemRows += `
            <tr>
                <td>${item.description || 'N/A'}</td>
                <td>${item.hsCode || 'N/A'}</td>
                <td>${item.origin || data.origin_country || 'CH'}</td>
                <td>${qty}</td>
                <td>${item.uom || 'PCS'}</td>
                <td>${curr} ${displayUnitPrice}</td>
                <td>${item.netWeight || 0} kg</td>
                <td>${curr} ${total}</td>
            </tr>
        `;
    });
    replacements.itemRows = itemRows;

    // ── Replace all {{key}} placeholders ────────────────────────────────────
    for (const [key, value] of Object.entries(replacements)) {
        // Replace both {{key}} template markers
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        html = html.replace(regex, value !== null && value !== undefined ? value : '');
    }

    // ── Handle optional Handlebars-style blocks: {{#if key}}...{{/if}} ──────
    // Show block if value is truthy, remove block (including content) if falsy
    html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
        return replacements[key] ? content : '';
    });

    return html;
};

/**
 * Generates and saves both Proforma Invoice HTML and PDF files to disk.
 * Returns the relative fileName of the PDF.
 */
exports.generateProformaInvoice = async (data, bookingId) => {
    try {
        const html = exports.generateProformaInvoiceHTML(data, bookingId);
        const baseFileName = `proforma-${bookingId}`;
        const dir = getInvoicesDir();

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save HTML version
        const htmlPath = path.join(dir, `${baseFileName}.html`);
        fs.writeFileSync(htmlPath, html);

        // Save PDF version using Puppeteer
        const pdfBuffer = await exports.generateProformaInvoiceBuffer(data, bookingId);
        const pdfPath = path.join(dir, `${baseFileName}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);

        // Return the PDF as the primary document
        return `${baseFileName}.pdf`;
    } catch (error) {
        console.error('Error saving proforma invoice documents:', error);
        throw error;
    }
};

exports.generateProformaInvoiceBuffer = async (data, bookingId) => {
    let browser;
    try {
        const html = exports.generateProformaInvoiceHTML(data, bookingId);

        if (isVercel) {
            // PRODUCTION: Use serverless-friendly chromium
            const chromium = require('@sparticuz/chromium');
            const puppeteerCore = require('puppeteer-core');
            
            console.log('[Puppeteer] Launching serverless chromium...');
            
            // Set graphics mode for better compatibility
            chromium.setGraphicsMode = false;

            browser = await puppeteerCore.launch({
                args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } else {
            // LOCAL: Use standard puppeteer
            const puppeteer = require('puppeteer');
            console.log('[Puppeteer] Launching local puppeteer...');
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
        }

        const page = await browser.newPage();

        // Set content and wait for it to load completely
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('Puppeteer PDF generation failed:', error);
        if (browser) await browser.close();

        // Lightweight fallback using PDFKit if Puppeteer fails
        console.log('Falling back to PDFKit for invoice generation...');
        return exports.generateProformaInvoiceBufferLegacy(data, bookingId);
    }
};

/**
 * OLD PDFKit version kept as a fallback.
 */
exports.generateProformaInvoiceBufferLegacy = (data, bookingId) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const curr = data.currency || data.currencyCode || 'CHF';
            const totalShippingPrice = parseFloat(data.totalShippingPrice || 0);
            const formattedDate = formatDate(data.invoice_date || data.createdAt);

            // Header
            doc.font('Helvetica-Bold').fontSize(18).text('BCIC Swiss GmbH', 40, 40);
            doc.font('Helvetica').fontSize(9).text('Lättichstrasse 6, 6340 Baar, Switzerland', 40, 62);

            doc.fontSize(22).font('Helvetica-Bold').text('PROFORMA INVOICE', 350, 40, { align: 'right', width: 200 });
            doc.fontSize(9).font('Helvetica').text(`Invoice No: ${data.invoice_number || data.invoiceNumber || 'N/A'}`, 350, 68, { align: 'right', width: 200 });
            doc.fontSize(9).font('Helvetica').text(`Date: ${formattedDate}`, 350, 80, { align: 'right', width: 200 });

            // Title block
            doc.rect(40, 120, 515, 28).stroke();
            doc.font('Helvetica-Bold').fontSize(14).text('PRO FORMA TAX INVOICE', 45, 129);

            // Consignor / Consignee
            const gridTop = 168;
            doc.rect(40, gridTop, 255, 60).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNOR', 45, gridTop + 4);
            doc.font('Helvetica').fontSize(9).text(data.origin_company || data.shipperName || 'BCIC Swiss GmbH', 45, gridTop + 16);
            doc.fontSize(8).text(`${data.origin_address || ''}, ${data.origin_city || ''} ${data.origin_zip || ''}, ${countryName(data.origin_country || data.originCountry || 'CH')}`, 45, gridTop + 28);

            doc.rect(295, gridTop, 260, 60).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNEE', 300, gridTop + 4);
            doc.font('Helvetica').fontSize(9).text(data.dest_company || data.receiverName || 'N/A', 300, gridTop + 16);
            doc.fontSize(8).text(`${data.dest_address || ''}, ${data.dest_city || ''} ${data.dest_zip || ''}, ${countryName(data.dest_country || data.destinationCountry)}`, 300, gridTop + 28);

            // Invoice meta
            const infoLabels = ['DATE', 'BOOKING ID', 'AWB', 'INCOTERMS'];
            const infoValues = [
                formattedDate,
                bookingId || data.bookingId || 'N/A',
                data.awb || 'N/A',
                data.incoterms || 'DAP',
            ];
            infoLabels.forEach((label, i) => {
                const y = gridTop + 80 + (i * 18);
                doc.rect(340, y, 90, 18).stroke();
                doc.rect(430, y, 125, 18).stroke();
                doc.font('Helvetica-Bold').fontSize(7).text(label, 345, y + 5, { width: 80, align: 'right' });
                doc.font('Helvetica').fontSize(8).text(infoValues[i], 435, y + 5);
            });

            // Items Table
            const tableTop = gridTop + 160;
            doc.rect(40, tableTop, 515, 20).stroke();
            doc.font('Helvetica-Bold').fontSize(8);
            doc.text('DESCRIPTION', 45, tableTop + 6);
            doc.text('HS CODE', 230, tableTop + 6);
            doc.text('ORIGIN', 300, tableTop + 6);
            doc.text('QTY', 350, tableTop + 6);
            doc.text('PRICE', 390, tableTop + 6);
            doc.text('TOTAL', 480, tableTop + 6, { align: 'right', width: 70 });

            let y = tableTop + 25;
            let items = data.items;
            if (typeof items === 'string') {
                try { items = JSON.parse(items); } catch (e) { items = null; }
            }

            if (!items || !Array.isArray(items)) {
                items = [{
                    description: data.commodity || 'Shipping Goods',
                    hsCode: data.hsCode || 'N/A',
                    origin: (data.origin_country || 'CH'),
                    quantity: data.quantity || 1,
                    unitPrice: data.unitPrice || 0
                }];
            }

            doc.font('Helvetica').fontSize(8);
            items.forEach((item, i) => {
                const itemQty = parseInt(item.quantity) || 1;
                const itemPrice = parseFloat(item.unitPrice || 0);
                const itemTotal = (itemQty * itemPrice).toFixed(2);

                doc.text(item.description || 'N/A', 45, y, { width: 175, height: 10, ellipsis: true });
                doc.text(item.hsCode || 'N/A', 230, y);
                doc.text(item.origin || 'CH', 300, y);
                doc.text(itemQty.toString(), 350, y);
                doc.text(`${curr} ${itemPrice.toFixed(2)}`, 390, y);
                doc.text(`${curr} ${itemTotal}`, 480, y, { align: 'right', width: 70 });
                y += 15;
            });

            // Totals
            const totalsY = Math.max(y + 20, 500);
            doc.rect(340, totalsY, 215, 40).stroke();
            doc.font('Helvetica-Bold').fontSize(9).text('TOTAL ESTIMATE', 350, totalsY + 6);
            doc.font('Helvetica-Bold').fontSize(14).text(`${curr} ${totalShippingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 350, totalsY + 18, { width: 195, align: 'right' });

            // Signature
            const sigY = 680;
            doc.moveTo(40, sigY).lineTo(200, sigY).stroke();
            doc.font('Helvetica').fontSize(8).text('Authorized Signature', 40, sigY + 5);
            doc.text('BCIC Swiss GmbH', 40, sigY + 18);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
