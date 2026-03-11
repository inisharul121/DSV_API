const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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
        invoiceNumber:      data.invoice_number  || data.invoiceNumber  || 'N/A',
        invoiceDate,
        invoiceType:        data.invoice_type    || data.invoiceType    || 'Proforma Invoice',
        bookingId:          bookingId            || data.bookingId      || 'N/A',
        awb:                data.awb             || bookingId           || 'N/A',

        // Signer
        signerName,
        signerPhone,

        // Origin / Shipper
        originCompany:      data.origin_company  || data.shipperName   || 'BCIC Swiss GmbH',
        originAddress:      data.origin_address  || 'Lättichstrasse 6',
        originCity:         data.origin_city     || 'Baar',
        originZip:          data.origin_zip      || '6340',
        originCountry:      (data.origin_country || data.originCountry || 'CH').toUpperCase(),
        originCountryName:  countryName(data.origin_country || data.originCountry || 'CH'),
        originContact:      data.origin_contact  || signerName,
        originPhone:        data.origin_phone    || signerPhone,
        originEmail:        data.origin_email    || '',
        originEori:         data.origin_eori     || '',
        pickupDate:         data.pickup_date     || invoiceDate,
        pickupInstructions: data.pickup_instructions || '',

        // Destination / Consignee
        destCompany:        data.dest_company    || data.receiverName   || 'N/A',
        destAddress:        data.dest_address    || '',
        destCity:           data.dest_city       || '',
        destZip:            data.dest_zip        || '',
        destCountry:        (data.dest_country   || data.destinationCountry || '').toUpperCase(),
        destCountryName:    countryName(data.dest_country || data.destinationCountry),
        destContact:        data.dest_contact    || '',
        destPhone:          data.dest_phone      || '',
        destEori:           data.dest_eori       || '',

        // Goods / Shipment
        commodity:          data.commodity       || 'Shipping Goods',
        hsCode:             data.hsCode          || data.hs_code        || 'N/A',
        originOfGoods:      data.originOfGoods   || data.commodity_origin || (data.origin_country || data.originCountry || 'CH').toUpperCase(),
        quantity:           data.quantity        || 1,
        uom:                data.uom             || 'PCS',
        unitPrice,
        goodsValue,
        netWeight:          data.netWeight       || data.weight         || 0,
        totalWeight:        data.totalWeight     || data.weight         || 0,
        height:             data.height          || 0,
        length:             data.length          || 0,
        width:              data.width           || 0,

        // Export details
        reasonForExport:    data.reasonForExport || 'Sale',
        incoterms:          data.incoterms       || 'DAP - Delivered at Place',
        serviceCode:        data.serviceCode     || 'N/A',
        iossNumber:         data.iossNumber      || '',

        // Financial
        currency:           curr,
        baseShippingPrice:  baseShipping,
        totalShippingPrice: totalShipping,
    };

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
 * Generates and saves a Proforma Invoice HTML file to disk.
 * Returns the relative fileName.
 */
exports.generateProformaInvoice = async (data, bookingId) => {
    try {
        const html = exports.generateProformaInvoiceHTML(data, bookingId);
        const fileName = `proforma-${bookingId}.html`;
        const dir = getInvoicesDir();
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, html);
        
        return fileName;
    } catch (error) {
        console.error('Error saving proforma invoice:', error);
        throw error;
    }
};

/**
 * Generates a Proforma Invoice PDF as a Buffer.

 * Kept as a lightweight fallback (pdfkit).
 */
exports.generateProformaInvoiceBuffer = (data, bookingId) => {
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
            doc.fontSize(8).fillColor('#666').text(`${data.origin_address || ''}, ${data.origin_city || ''} ${data.origin_zip || ''}, ${countryName(data.origin_country || data.originCountry || 'CH')}`, 45, gridTop + 28);
            doc.fillColor('#000');

            doc.rect(295, gridTop, 260, 60).stroke();
            doc.font('Helvetica-Bold').fontSize(8).text('CONSIGNEE', 300, gridTop + 4);
            doc.font('Helvetica').fontSize(9).text(data.dest_company || data.receiverName || 'N/A', 300, gridTop + 16);
            doc.fontSize(8).fillColor('#666').text(`${data.dest_address || ''}, ${data.dest_city || ''} ${data.dest_zip || ''}, ${countryName(data.dest_country || data.destinationCountry)}`, 300, gridTop + 28);
            doc.fillColor('#000');

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

            // Totals
            doc.moveDown(20);
            doc.font('Helvetica-Bold').fontSize(13)
               .text(`TOTAL ${curr}: ${totalShippingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 40, 580);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
