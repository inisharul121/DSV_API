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
        console.log(`[InvoiceGen] Target directory: ${dir}`);

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (mkdirErr) {
                console.warn(`[InvoiceGen] Failed to create directory ${dir}:`, mkdirErr.message);
                // On Vercel, /tmp should exist, but let's be safe
            }
        }

        // Save HTML version
        const htmlPath = path.join(dir, `${baseFileName}.html`);
        try {
            fs.writeFileSync(htmlPath, html);
        } catch (fErr) {
            console.warn(`[InvoiceGen] Could not save HTML to disk: ${fErr.message}`);
        }

        // Save PDF version using Puppeteer
        const pdfBuffer = await exports.generateProformaInvoiceBuffer(data, bookingId);
        const pdfPath = path.join(dir, `${baseFileName}.pdf`);
        try {
            fs.writeFileSync(pdfPath, pdfBuffer);
        } catch (fErr) {
            console.warn(`[InvoiceGen] Could not save PDF to disk: ${fErr.message}`);
        }

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
            const signerName = data.invoice_signature || data.origin_contact || 'Mazharul Sheikh';

            // 1. TOP HEADER SECTION
            doc.rect(40, 40, 260, 95).stroke(); // Left box
            doc.font('Helvetica-Bold').fontSize(16).text('Limber Cargo', 45, 48);
            doc.font('Helvetica').fontSize(8).text('Lättichstrasse 6, 6340 Baar, Switzerland', 45, 65);
            doc.text(`Country Code: CH`, 45, 75);
            doc.text(`Contact: ${signerName}`, 45, 85);
            doc.text(`Phone: ${data.origin_phone || '+41786195928'}`, 45, 95);

            doc.rect(300, 40, 255, 95).stroke(); // Right box
            doc.fontSize(18).font('Helvetica-Bold').text('PROFORMA', 305, 48, { align: 'right', width: 240 });
            doc.fontSize(18).text('INVOICE', 305, 68, { align: 'right', width: 240 });
            doc.fontSize(8).font('Helvetica').text(`Invoice No: ${data.invoice_number || data.invoiceNumber || 'N/A'}`, 305, 95, { align: 'right', width: 240 });
            doc.text(`Date: ${formattedDate}`, 305, 105, { align: 'right', width: 240 });
            doc.text(`Booking ID: ${bookingId || data.bookingId || 'N/A'}`, 305, 115, { align: 'right', width: 240 });

            // 2. SHIPPER & CONSIGNEE
            doc.font('Helvetica-Bold').fontSize(10).text('SHIPPER & CONSIGNEE INFORMATION', 40, 150);
            
            const gridTop = 165;
            // Shipper Box
            doc.rect(40, gridTop, 252, 110).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('SHIPPER (SENDER)', 45, gridTop + 5, { underline: true });
            doc.font('Helvetica').fontSize(8);
            doc.text(`Company: ${data.origin_company || data.shipperName || 'Limber Cargo'}`, 45, gridTop + 18);
            doc.text(`Address: ${data.origin_address || 'N/A'}`, 45, gridTop + 28);
            doc.text(`City/ZIP: ${data.origin_city || ''} ${data.origin_zip || ''}`, 45, gridTop + 38);
            doc.text(`Country: ${countryName(data.origin_country || 'CH')} (${data.origin_country || 'CH'})`, 45, gridTop + 48);
            doc.text(`Contact: ${data.origin_contact || signerName}`, 45, gridTop + 58);
            doc.text(`Phone: ${data.origin_phone || 'N/A'}`, 45, gridTop + 68);
            doc.text(`E-Mail: ${data.origin_email || ''}`, 45, gridTop + 78);
            doc.text(`Pickup: ${formatDate(data.pickup_date || data.createdAt)}`, 45, gridTop + 88);

            // Consignee Box
            doc.rect(302, gridTop, 253, 110).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNEE (RECEIVER)', 307, gridTop + 5, { underline: true });
            doc.font('Helvetica').fontSize(8);
            doc.text(`Company: ${data.dest_company || data.receiverName || 'N/A'}`, 307, gridTop + 18);
            doc.text(`Address: ${data.dest_address || 'N/A'}`, 307, gridTop + 28);
            doc.text(`City/ZIP: ${data.dest_city || ''} ${data.dest_zip || ''}`, 307, gridTop + 38);
            doc.text(`Country: ${countryName(data.dest_country)} (${data.dest_country || ''})`, 307, gridTop + 48);
            doc.text(`Contact: ${data.dest_contact || 'N/A'}`, 307, gridTop + 58);
            doc.text(`Phone: ${data.dest_phone || 'N/A'}`, 307, gridTop + 68);
            doc.text(`Shipping Charges: Sender`, 307, gridTop + 78);
            doc.text(`Duties & Taxes: Receiver`, 307, gridTop + 88);

            // 3. SHIPMENT DETAILS
            doc.font('Helvetica-Bold').fontSize(10).text('SHIPMENT DETAILS', 40, 290);
            const tableTop = 305;
            
            // Table Header
            doc.rect(40, tableTop, 515, 20).stroke();
            doc.fontSize(7);
            doc.text('DESCRIPTION OF GOODS', 45, tableTop + 7);
            doc.text('HS CODE', 225, tableTop + 7);
            doc.text('COUNTRY OF ORIGIN', 280, tableTop + 7);
            doc.text('QTY', 375, tableTop + 7);
            doc.text('UOM', 395, tableTop + 7);
            doc.text('UNIT PRICE', 435, tableTop + 7);
            doc.text('NET WEIGHT', 495, tableTop + 7);
            doc.text('TOTAL VALUE', 545, tableTop + 7, { align: 'right', width: 10 }); // Dummy width to align text right

            // Table Rows
            let y = tableTop + 20;
            let items = data.items;
            if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { items = null; } }
            if (!items || !Array.isArray(items)) {
                items = [{ description: data.commodity || 'Shipping Goods', hsCode: data.hsCode || 'N/A', origin: (data.origin_country || 'CH'), quantity: data.quantity || 1, uom: data.uom || 'Pieces', unitPrice: data.unitPrice, netWeight: data.netWeight || data.weight || 0 }];
            }

            items.forEach((item) => {
                doc.rect(40, y, 515, 18).stroke();
                doc.font('Helvetica').fontSize(7);
                doc.text(item.description || 'N/A', 45, y + 5, { width: 170, ellipsis: true });
                doc.text(item.hsCode || 'N/A', 225, y + 5);
                doc.text(item.origin || data.origin_country || 'CH', 280, y + 5);
                doc.text(item.quantity?.toString() || '1', 375, y + 5);
                doc.text(item.uom || 'Pieces', 395, y + 5);
                doc.text(`${curr} ${parseFloat(item.unitPrice || 0).toFixed(2)}`, 435, y + 5);
                doc.text(`${item.netWeight || 0} kg`, 495, y + 5);
                const val = (parseFloat(item.unitPrice || 0) * (parseInt(item.quantity) || 1)).toFixed(2);
                doc.text(`${curr} ${val}`, 510, y + 5, { align: 'right', width: 40 });
                y += 18;
            });

            // 4. BOTTOM INFO BOXES
            const bottomBoxTop = y + 15;
            doc.rect(40, bottomBoxTop, 252, 65).stroke();
            doc.font('Helvetica').fontSize(8);
            doc.text(`Gross Weight: ${data.totalWeight || data.weight || 0} kg`, 45, bottomBoxTop + 8);
            doc.text(`Net Weight: ${data.netWeight || data.weight || 0} kg`, 45, bottomBoxTop + 18);
            doc.text(`Dimensions (HxLxW): ${data.height || 0}x${data.length || 0}x${data.width || 0} cm`, 45, bottomBoxTop + 28);
            doc.text(`No. of Packages: ${data.quantity || 1} pcs`, 45, bottomBoxTop + 38);
            doc.text(`Incoterms: ${data.incoterms || 'DAP'}`, 45, bottomBoxTop + 48);

            doc.rect(302, bottomBoxTop, 253, 65).stroke();
            doc.text(`Service Code: ${data.serviceCode || 'DSVAirExpress'}`, 307, bottomBoxTop + 8);
            doc.text(`AWB / Shipment Ref: ${data.awb || bookingId || 'N/A'}`, 307, bottomBoxTop + 18);
            doc.text(`Invoice Type: PROFORMA`, 307, bottomBoxTop + 28);
            doc.text(`IOSS Number: ${data.iossNumber || ''}`, 307, bottomBoxTop + 38);

            // 5. TOTALS
            const totalY = bottomBoxTop + 80;
            doc.rect(302, totalY, 253, 35).stroke();
            doc.font('Helvetica-Bold').fontSize(10).text('TOTAL ESTIMATE:', 307, totalY + 12);
            doc.fontSize(14).text(`${curr} ${totalShippingPrice.toFixed(2)}`, 307, totalY + 10, { align: 'right', width: 240 });

            // 6. SIGNATURE
            const sigY = totalY + 80;
            doc.moveTo(40, sigY).lineTo(200, sigY).stroke();
            doc.font('Helvetica').fontSize(8).text('Authorized Signature', 40, sigY + 5);
            doc.text('Limber Cargo', 40, sigY + 15);
            
            doc.moveTo(350, sigY).lineTo(510, sigY).stroke();
            doc.text(signerName, 350, sigY + 5);
            doc.text('Signer / Responsible Person', 350, sigY + 15);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
