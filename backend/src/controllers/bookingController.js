const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const labelExtractor = require('../utils/labelExtractor');
const Order = require('../models/Order');
const ProformaInvoice = require('../models/ProformaInvoice');
const jwt = require('jsonwebtoken');
const invoiceGenerator = require('../utils/invoiceGenerator');
const countryHelper = require('../utils/countryHelper');
const dsvDocumentUploader = require('../utils/dsvDocumentUploader');
const dsvClient = require('../config/dsv-api');

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || 'limber-cargo-customer-secret-2026';

// Helper: extract customer ID from optional Bearer token
const extractCustomerId = (req) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.id || null;
    } catch {
        return null;
    }
};

// Helper to save label from base64 or buffer
const saveLabel = async (labelData, bookingId) => {
    const fileName = `label-${bookingId}.pdf`;
    const filePath = path.join(config.paths.labels, fileName);

    // Ensure directory exists
    if (!fs.existsSync(config.paths.labels)) {
        fs.mkdirSync(config.paths.labels, { recursive: true });
    }

    // If labelData is base64 string
    const buffer = Buffer.from(labelData, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    return fileName;
};

const payloadBuilder = require('../utils/payloadBuilder');

exports.createSimpleBooking = async (req, res) => {
    try {
        let shipmentData = req.body.shipmentData;

        // Handle multipart/form-data where shipmentData might be a stringified JSON
        if (typeof shipmentData === 'string') {
            try {
                shipmentData = JSON.parse(shipmentData);
            } catch (pErr) {
                console.error('Failed to parse stringified shipmentData:', pErr);
            }
        }

        if (!shipmentData) {
            return res.status(400).json({ success: false, error: 'shipmentData is required' });
        }

        console.log('[BOOKING] Processing shipment for:', shipmentData.dest_country || shipmentData.delivery?.countryCode);

        // Transform frontend data to DSV API format
        const dsvPayload = payloadBuilder.buildBookingPayload(shipmentData);

        console.log('Sending Payload to DSV:', JSON.stringify(dsvPayload, null, 2));

        // 1. Submit Draft Booking
        const bookingUrl = `${config.dsv.endpoints.booking}/booking/v2/bookings`;
        const draftResponse = await dsvClient.post(bookingUrl, dsvPayload);

        const bookingId = draftResponse.data.shipmentIdentificationNumber || draftResponse.data.bookingId;

        if (!bookingId) {
            console.error('DSV Response missing ID:', draftResponse.data);
            throw new Error('Failed to create booking: No Booking ID or Shipment ID returned');
        }

        console.log(`Draft Shipment Created: ${bookingId}`);

        // --- SMART FLOW LOGIC ---
        const destCountry = (shipmentData.dest_country || shipmentData.delivery?.countryCode || "DE").trim().toUpperCase();
        const isComplex = countryHelper.isComplexFlow(destCountry);
        console.log(`[SMART-FLOW] Dest: ${destCountry}, IsComplex: ${isComplex}`);
        let savedInvoicePath = null;

        if (isComplex) {
            console.log(`[BOOKING] Complex Flow detected for ${destCountry}. Generating and uploading mandatory documents...`);

            // 1. Generate Proforma Invoice for DSV
            const invoiceFileName = await invoiceGenerator.generateProformaInvoice(shipmentData, bookingId);
            const invoiceFilePath = path.join(config.paths.invoices, invoiceFileName);
            savedInvoicePath = `/invoices/${invoiceFileName}`;

            // 2. Upload to DSV Draft
            try {
                await dsvDocumentUploader.uploadDocumentToDraft(bookingId, invoiceFilePath, 'COMMERCIAL_INVOICE');
                console.log(`[BOOKING] Commercial Invoice uploaded to DSV draft ${bookingId}`);
            } catch (uploadError) {
                console.warn(`[BOOKING] DSV Document Upload failed for ${bookingId}, but continuing...`, uploadError.message);
            }
        }

        // 1.5 Handle User Manual Uploads (if any)
        if (req.files && req.files.length > 0) {
            console.log(`[BOOKING] Uploading ${req.files.length} user-provided documents for draft ${bookingId}`);
            for (const file of req.files) {
                try {
                    // Temporarily save buffer to disk if multer is memoryStorage
                    // (Assuming middleware uses diskStorage or we can read from disk)
                    // If multer is using memoryStorage, we need to handle it in dsvDocumentUploader
                    await dsvDocumentUploader.uploadDocumentToDraft(bookingId, file.path, 'OTHER');
                    console.log(`[BOOKING] User document ${file.originalname} uploaded to DSV`);
                } catch (userUpErr) {
                    console.error(`[BOOKING] Failed to upload user document ${file.originalname}:`, userUpErr.message);
                }
            }
        }

        // 2. Confirm Booking and Get Labels
        // Try fallback paths if one fails
        const pathsToTry = [
            `${config.dsv.endpoints.booking}/v2/bookings/labels/${bookingId}?labelFormat=PDF`,
            `${config.dsv.endpoints.booking}/booking/v2/bookings/labels/${bookingId}?labelFormat=PDF`,
            `${config.dsv.endpoints.booking}/booking/v2/shipments/${bookingId}/labels?labelFormat=PDF`
        ];

        let labelResponse = null;
        let lastError = null;

        for (const url of pathsToTry) {
            try {
                console.log(`[BOOKING] Attempting label retrieval from: ${url}`);
                // Switch to GET for labels
                const response = await dsvClient.get(url);

                if (response.data && (response.data.labelResults || response.data.packageLabels)) {
                    labelResponse = response.data;
                    console.log(`[BOOKING] Labels retrieved successfully from: ${url}`);
                    break;
                }
            } catch (err) {
                const status = err.response?.status;
                const message = err.response?.data?.message || err.message;
                console.warn(`[BOOKING] Path failed: ${url} (${status}: ${message})`);
                lastError = err;
            }
        }

        if (!labelResponse) {
            console.warn('All label paths failed (likely due to no subscription). Proceeding without labels.');
        }

        let savedLabelPath = null;
        if (labelResponse) {
            const labelContent = labelExtractor.extractLabelContent(labelResponse);

            if (labelContent) {
                savedLabelPath = await saveLabel(labelContent, bookingId);
                console.log(`Label saved to: ${savedLabelPath}`);
            } else {
                console.warn('[BOOKING] labelResponse received but contained no valid labelContent or shippingLabel.');
            }
        }

        // 2.5 Generate Proforma Invoice PDF if not already done in Complex Flow logic above
        if (!savedInvoicePath) {
            try {
                console.log(`[BOOKING] Generating proforma invoice for: ${bookingId}`);
                const invoiceFile = await invoiceGenerator.generateProformaInvoice(shipmentData, bookingId);
                savedInvoicePath = `/invoices/${invoiceFile}`;
                console.log(`[BOOKING] Proforma invoice generated: ${savedInvoicePath}`);
            } catch (invError) {
                console.error('[BOOKING] Failed to generate proforma invoice:', invError.message);
            }
        }

        // 3. Save Order to Local Database
        try {
            const customerId = extractCustomerId(req);
            const order = await Order.create({
                bookingId: bookingId,
                awb: draftResponse.data.shipmentIdentificationNumber || bookingId,
                shipperName: shipmentData.origin_company || shipmentData.pickup?.address?.companyName || "Sender",
                receiverName: shipmentData.dest_company || shipmentData.delivery?.companyName || "Receiver",
                originCountry: (shipmentData.origin_country || shipmentData.pickup?.address?.countryCode || "CH").substring(0, 2),
                destinationCountry: (shipmentData.dest_country || shipmentData.delivery?.countryCode || "DE").substring(0, 2),
                serviceCode: shipmentData.serviceCode || "DSVAirExpress",
                totalWeight: parseFloat(shipmentData.weight || 1.0),
                goodsValue: shipmentData.items?.length > 0 
                    ? shipmentData.items.reduce((sum, item) => sum + (parseFloat(item.unitPrice || 0) * (parseInt(item.quantity) || 1)), 0)
                    : parseFloat(shipmentData.goodsValue || 0),
                currency: shipmentData.currencyCode || "CHF",
                status: 'Created',
                labelUrl: savedLabelPath ? `/api/labels/${savedLabelPath}` : null,
                invoiceUrl: savedInvoicePath ? `/api${savedInvoicePath}` : null,
                hsCode: shipmentData.items?.[0]?.hsCode || shipmentData.hsCode || null,
                quantity: shipmentData.items?.length > 0
                    ? shipmentData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0)
                    : (parseInt(shipmentData.quantity) || 1),
                unitPrice: shipmentData.items?.[0]?.unitPrice || parseFloat(shipmentData.unitPrice || 0),
                netWeight: parseFloat(shipmentData.netWeight || 0),
                uom: shipmentData.items?.[0]?.uom || shipmentData.uom || 'Pieces',
                reasonForExport: shipmentData.reasonForExport || null,
                incoterms: shipmentData.incoterms || null,
                originOfGoods: shipmentData.commodity_origin || null,
                origin_eori: shipmentData.origin_eori || null,
                dest_eori: shipmentData.dest_eori || null,
                iossNumber: shipmentData.iossNumber || null,
                invoice_number: shipmentData.invoice_number || null,
                invoice_type: shipmentData.invoice_type || null,
                invoice_signature: shipmentData.invoice_signature || null,
                totalShippingPrice: parseFloat(shipmentData.totalShippingPrice || 0),
                baseShippingPrice: parseFloat(shipmentData.totalShippingPrice || 0), // Base price fallback to total for now
                customerId: customerId,
                labelData: labelResponse ? labelExtractor.extractLabelContent(labelResponse) : null,
                // Save complete address/contact details for future invoice generation
                originAddress: shipmentData.origin_address || shipmentData.pickup?.address?.addressLine1 || "",
                originCity: shipmentData.origin_city || shipmentData.pickup?.address?.city || "",
                originZip: shipmentData.origin_zip || shipmentData.pickup?.address?.zipCode || "",
                originPhone: shipmentData.origin_phone || shipmentData.pickup?.address?.contactPhoneNumber || "",
                originEmail: shipmentData.origin_email || shipmentData.sender?.email || "",
                destAddress: shipmentData.dest_address || shipmentData.delivery?.addressLine1 || "",
                destCity: shipmentData.dest_city || shipmentData.delivery?.city || "",
                destZip: shipmentData.dest_zip || shipmentData.delivery?.zipCode || "",
                destPhone: shipmentData.dest_phone || shipmentData.delivery?.contactPhoneNumber || "",
                destEmail: shipmentData.dest_email || shipmentData.receiver?.email || "",
                destContact: shipmentData.dest_contact || shipmentData.delivery?.contactName || "",
                items: shipmentData.items || null
            });

            // Create ProformaInvoice record
            await ProformaInvoice.create({
                orderId: order.id,
                invoiceNumber: shipmentData.invoice_number || `INV-${bookingId}`,
                totalAmount: parseFloat(shipmentData.totalShippingPrice || 0),
                baseAmount: parseFloat(shipmentData.baseShippingPrice || 0),
                taxAmount: 0, // Could be calculated if needed
                currency: shipmentData.currencyCode || "CHF",
                invoiceUrl: savedInvoicePath,
                status: 'Generated'
            });

            console.log(`Order ${bookingId} and ProformaInvoice saved to database${customerId ? ` (customer: ${customerId})` : ''}`);
        } catch (dbError) {
            console.error('Failed to save order to local database:', dbError);
            // Don't fail the request if just the local save fails, 
            // the shipment was already created in DSV
        }

        res.status(201).json({
            success: true,
            bookingId,
            shipmentId: bookingId,
            labelUrl: savedLabelPath ? `/api/labels/${savedLabelPath}` : null,
            invoiceUrl: savedInvoicePath ? `/api${savedInvoicePath}` : null,
            labelWarning: !savedLabelPath ? "Booking created but no labels could be retrieved (this is normal if you don't have a label subscription)." : null,
            trackingUrl: `https://track.dsv.com?bookingId=${bookingId}`
        });

    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error('DSV API Error Body:', JSON.stringify(errorData, null, 2));
        res.status(error.response?.status || 500).json({
            success: false,
            error: errorData
        });
    }
};



exports.createComplexBooking = async (req, res) => {
    try {
        const { shipmentData } = req.body;
        const files = req.files; // processed by multer

        // 1. Submit Draft
        const draftUrl = `${config.dsv.endpoints.booking}/bookings/draft`;
        const draftResponse = await dsvClient.post(draftUrl, shipmentData);
        const { draftId } = draftResponse.data;

        // 2. Upload Documents
        if (files && files.length > 0) {
            for (const file of files) {
                // multipart/form-data upload
                const docUrl = `${config.dsv.endpoints.booking}/bookings/${draftId}/documents`;
                const formData = new FormData();
                formData.append('file', new Blob([file.buffer]), file.originalname);
                formData.append('type', file.fieldname); // e.g., 'invoice'

                // Need to handle FormData headers with axios, simpler way might be needed in Node
                // for now, pseudo-code thought process
                /*
                await dsvClient.post(docUrl, formData, {
                   headers: { ...formDataHeaders }
                });
                */
                console.log(`[Mock] Uploading ${file.originalname} for draft ${draftId}`);
            }
        }

        // 3. Confirm
        const confirmUrl = `${config.dsv.endpoints.booking}/bookings/${draftId}/confirm`;
        const confirmResponse = await dsvClient.post(confirmUrl, {
            labelFormat: 'PDF'
        });

        // ... handle response same as simple booking
        res.status(201).json({
            success: true,
            bookingId: confirmResponse.data.bookingId,
            // ...
        });

    } catch (error) {
        console.error('Complex Booking Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};
