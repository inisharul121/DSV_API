const dsvClient = require('../config/dsv-api');
const config = require('../config/env');
const path = require('path');
const fs = require('fs');

// Metadata for each test case
const TEST_CASES = {
    TC1: { name: 'Standard Domestic Shipment', description: 'Basic air express booking CH → CH, single parcel', type: 'booking' },
    TC2: { name: 'International Export (CH→DE)', description: 'Cross-border air express booking CH → DE', type: 'booking' },
    TC3: { name: 'Multi-Package Shipment', description: 'Multiple packages, standard weight', type: 'booking' },
    TC4: { name: 'Heavy Parcel', description: 'Oversized/heavy package shipment', type: 'booking' },
    TC5: { name: 'Economy Service', description: 'Economy service code booking', type: 'booking' },
    TC6: { name: 'DDP Payment Mode', description: 'Duties and taxes paid by sender (DDP)', type: 'booking' },
    TC7: { name: 'Document Shipment', description: 'Document package type shipment', type: 'booking' },
    TC8: { name: 'Residential Delivery', description: 'Delivery to a residential address', type: 'booking' },
};

/**
 * GET /api/certification/tests
 * Returns the list of all test cases with metadata
 */
exports.getTestCases = (req, res) => {
    const cases = Object.entries(TEST_CASES).map(([id, meta]) => {
        const payloadPath = path.join(__dirname, '../../certification_payloads', `${id}.json`);
        const payloadExists = fs.existsSync(payloadPath);
        let payload = null;
        if (payloadExists) {
            payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
        }
        return { id, ...meta, payloadExists, payload };
    });
    res.json({ success: true, testCases: cases });
};

/**
 * POST /api/certification/run/:testId
 * Loads a certification payload and submits it to the DSV Booking API
 * Uses x-cert-id header matching the testId
 */
exports.runTest = async (req, res) => {
    const { testId } = req.params;

    if (!TEST_CASES[testId]) {
        return res.status(400).json({ success: false, error: `Unknown test case: ${testId}` });
    }

    const payloadPath = path.join(__dirname, '../../certification_payloads', `${testId}.json`);
    if (!fs.existsSync(payloadPath)) {
        return res.status(404).json({ success: false, error: `Payload file not found: ${testId}.json` });
    }

    // Load and update dates in the payload to be current
    const rawPayload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
    const now = new Date();
    const collectFrom = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    const collectTo = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const formatISO = (d) => d.toISOString().split('.')[0] + 'Z';

    // Update dates to be current (otherwise the API may reject stale dates)
    if (rawPayload.pickup) {
        rawPayload.pickup.collectDateFrom = formatISO(collectFrom);
        rawPayload.pickup.collectDateTo = formatISO(collectTo);
    }

    console.log(`[CERTIFICATION] Running ${testId}...`);
    console.log('[CERTIFICATION] Payload:', JSON.stringify(rawPayload, null, 2));

    const startTime = Date.now();
    try {
        const bookingUrl = `${config.dsv.endpoints.booking}/booking/v2/bookings`;

        // Force the cert header for this specific test
        const response = await dsvClient.post(bookingUrl, rawPayload, {
            headers: { 'x-cert-id': testId }
        });

        const elapsed = Date.now() - startTime;
        const bookingId = response.data.shipmentIdentificationNumber || response.data.bookingId;

        console.log(`[CERTIFICATION] ${testId} SUCCESS — Booking ID: ${bookingId}`);

        // Attempt to get labels
        let labelUrl = null;
        if (bookingId) {
            try {
                const lblResponse = await dsvClient.post(
                    `${config.dsv.endpoints.booking}/booking/v2/bookings/${bookingId}/labels`,
                    { labelFormat: 'PDF' },
                    { headers: { 'x-cert-id': testId } }
                );
                if (lblResponse.data?.packageLabels?.length > 0) {
                    const lbl = lblResponse.data.packageLabels[0]?.labelContent;
                    if (lbl) {
                        const labelsDir = config.paths?.labels || './public/labels';
                        if (!fs.existsSync(labelsDir)) fs.mkdirSync(labelsDir, { recursive: true });
                        const fname = `cert-${testId}-${bookingId}.pdf`;
                        await fs.promises.writeFile(path.join(labelsDir, fname), Buffer.from(lbl, 'base64'));
                        labelUrl = `/labels/${fname}`;
                    }
                }
            } catch (lblErr) {
                console.warn(`[CERTIFICATION] Label fetch failed for ${testId}:`, lblErr.message);
            }
        }

        res.json({
            success: true,
            testId,
            bookingId,
            elapsed,
            labelUrl,
            response: response.data
        });

    } catch (error) {
        const elapsed = Date.now() - startTime;
        const errorData = error.response?.data || error.message;
        console.error(`[CERTIFICATION] ${testId} FAILED:`, JSON.stringify(errorData, null, 2));

        res.status(error.response?.status || 500).json({
            success: false,
            testId,
            elapsed,
            error: errorData,
            status: error.response?.status
        });
    }
};
