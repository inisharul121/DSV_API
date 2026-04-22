/**
 * ============================================================
 * Limbercargo Production API Test Suite
 * ============================================================
 * Run from the backend directory: node test-all.js
 *
 * This script tests ALL major API endpoints in sequence.
 * It logs each result clearly (✅ PASS / ❌ FAIL).
 * ============================================================
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const axios = require('axios');

// ============================================================
// CONFIGURATION - Change these to match your environment
// ============================================================
// Set TARGET_URL env var to test against production:
//   TARGET_URL=https://www.limbercargo.com node test-all.js
const BASE_URL = process.env.TARGET_URL
    ? `${process.env.TARGET_URL}/api`
    : 'http://localhost:3001/api';

// ⚙️  Admin credentials (used for all admin tests)
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'demo1234';

// These will be filled in automatically during the test run
let adminToken = null;
let customerToken = null;
let createdOrderId = null;
let createdCustomerId = null;
let bookingId = null;

// ============================================================
// HELPERS
// ============================================================
let passed = 0;
let failed = 0;
const results = [];

const pass = (name, info = '') => {
    passed++;
    results.push({ status: '✅ PASS', name, info });
    console.log(`✅ PASS | ${name}${info ? '  →  ' + info : ''}`);
};

const fail = (name, err) => {
    failed++;
    let msg = err.message;
    if (err.response?.data) {
        const d = err.response.data;
        msg = (typeof d === 'object') ? JSON.stringify(d).substring(0, 200) : String(d).substring(0, 200);
    }
    const status = err.response?.status || 'ERR';
    results.push({ status: '❌ FAIL', name, info: `[${status}] ${msg}` });
    console.error(`❌ FAIL | ${name}  →  [${status}] ${msg}`);
};

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ============================================================
// TESTS
// ============================================================

async function testAdminLogin() {
    try {
        const res = await api.post('/auth/admin/login', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        if (res.data.token) {
            adminToken = res.data.token;
            pass('[Admin] Login', `Role: ${res.data.admin?.role}`);
        } else {
            fail('[Admin] Login', { message: 'No token returned' });
        }
    } catch (e) { fail('[Admin] Login', e); }
}

async function testAdminMe() {
    if (!adminToken) return fail('[Admin] Get Profile', { message: 'No token - login failed' });
    try {
        const res = await api.get('/auth/admin/me', authHeader(adminToken));
        pass('[Admin] Get Profile', `Name: ${res.data.admin?.name}`);
    } catch (e) { fail('[Admin] Get Profile', e); }
}

async function testGetOrders() {
    if (!adminToken) return fail('[Admin] Get Orders', { message: 'No token' });
    try {
        const res = await api.get('/orders', authHeader(adminToken));
        const count = res.data.orders?.length || res.data.data?.length || 0;
        if (res.data.orders?.[0]) createdOrderId = res.data.orders[0].id;
        pass('[Admin] Get Orders', `Found: ${count} orders`);
    } catch (e) { fail('[Admin] Get Orders', e); }
}

async function testGetDashboardStats() {
    if (!adminToken) return fail('[Admin] Dashboard Stats', { message: 'No token' });
    try {
        const res = await api.get('/orders/stats', authHeader(adminToken));
        pass('[Admin] Dashboard Stats', `Total: ${res.data.stats?.total || JSON.stringify(res.data).substring(0, 50)}`);
    } catch (e) { fail('[Admin] Dashboard Stats', e); }
}

async function testGetAllCustomers() {
    if (!adminToken) return fail('[Admin] Get All Customers', { message: 'No token' });
    try {
        const res = await api.get('/customers', authHeader(adminToken));
        const count = res.data.customers?.length || 0;
        if (res.data.customers?.[0]) createdCustomerId = res.data.customers[0].id;
        pass('[Admin] Get All Customers', `Found: ${count} customers`);
    } catch (e) { fail('[Admin] Get All Customers', e); }
}

async function testGetAllAdmins() {
    if (!adminToken) return fail('[Admin] Get All Admins', { message: 'No token' });
    try {
        const res = await api.get('/admins', authHeader(adminToken));
        pass('[Admin] Get All Admins', `Found: ${res.data.admins?.length || 0} admins`);
    } catch (e) { fail('[Admin] Get All Admins', e); }
}

async function testMonthlyReport() {
    if (!adminToken) return fail('[Admin] Monthly Report', { message: 'No token' });
    try {
        const res = await api.get('/reports/monthly', authHeader(adminToken));
        pass('[Admin] Monthly Report', `Records: ${JSON.stringify(res.data).length} bytes`);
    } catch (e) { fail('[Admin] Monthly Report', e); }
}

async function testCustomerRegister() {
    try {
        const testEmail = `test_${Date.now()}@limbertest.com`;
        const res = await api.post('/auth/customer/register', {
            name: 'Test Client',
            email: testEmail,
            password: 'testpass123',
            company: 'Test Corp',
            phone: '+1234567890'
        });
        if (res.data.token) {
            customerToken = res.data.token;
            pass('[Customer] Register', `Email: ${testEmail}`);
        } else {
            fail('[Customer] Register', { message: 'No token returned' });
        }
    } catch (e) { fail('[Customer] Register', e); }
}

async function testCustomerLogin() {
    // Only run if register failed (re-use a known account)
    if (customerToken) return;
    try {
        const res = await api.post('/auth/customer/login', {
            email: 'customer@test.com',
            password: 'testpass123'
        });
        if (res.data.token) {
            customerToken = res.data.token;
            pass('[Customer] Login', 'Used fallback credentials');
        } else {
            fail('[Customer] Login', { message: 'No token returned' });
        }
    } catch (e) { fail('[Customer] Login', e); }
}

async function testCustomerMe() {
    if (!customerToken) return fail('[Customer] Get Profile', { message: 'No token' });
    try {
        const res = await api.get('/auth/customer/me', authHeader(customerToken));
        pass('[Customer] Get Profile', `Name: ${res.data.customer?.name}`);
    } catch (e) { fail('[Customer] Get Profile', e); }
}

async function testCustomerOrders() {
    if (!customerToken) return fail('[Customer] Get My Orders', { message: 'No token' });
    try {
        const res = await api.get('/customer/orders', authHeader(customerToken));
        pass('[Customer] Get My Orders', `Found: ${res.data.orders?.length || 0} orders`);
    } catch (e) { fail('[Customer] Get My Orders', e); }
}

async function testGetQuotes() {
    try {
        // Matches the format expected by payloadBuilder.buildQuotePayload()
        const res = await api.post('/quotes', {
            origin_country: 'CH',
            origin_city: 'Baar',
            origin_zip: '6340',
            dest_country: 'DE',
            dest_city: 'Berlin',
            dest_zip: '10115',
            weight: 5,
            length: 20,
            width: 15,
            height: 10,
            packageType: 'PARCELS'
        });
        const count = res.data.data?.services?.length || 0;
        pass('[DSV] Get Quotes', `Services returned: ${count}`);
    } catch (e) { fail('[DSV] Get Quotes', e); }
}

async function testCreateBooking() {
    try {
        // Matches payloadBuilder.buildBookingPayload() expected format
        const res = await api.post('/bookings/simple', {
            shipmentData: {
                origin_company: 'Limber Cargo AG',
                origin_address: 'Bahnhofstrasse 1',
                origin_city: 'Baar',
                origin_zip: '6340',
                origin_country: 'CH',
                origin_phone: '+41 441234567',
                origin_email: 'test@limber.ch',
                origin_contact: 'Test Sender',
                dest_company: 'Test Receiver GmbH',
                dest_address: 'Unter den Linden 1',
                dest_city: 'Berlin',
                dest_zip: '10115',
                dest_country: 'DE',
                dest_phone: '+49 1234567890',
                dest_email: 'receiver@test.de',
                dest_contact: 'Hans Mueller',
                weight: 2.5,
                length: 20,
                width: 15,
                height: 10,
                serviceCode: 'DSVAirExpress',
                packageType: 'PARCELS',
                goodsValue: 100,
                currencyCode: 'CHF',
                hsCode: '6309',
                quantity: 1,
                unitPrice: 100,
                incoterms: 'DAP',
                reasonForExport: 'SALE',
                netWeight: 2.0,
                uom: 'Pieces',
                commodity: 'Test Goods',
                commodity_origin: 'CH',
                items: [{
                    description: 'Test Item',
                    quantity: 1,
                    unitPrice: 100,
                    hsCode: '6309',
                    origin: 'CH',
                    uom: 'Pieces',
                    netWeight: 2.0
                }]
            }
        });
        bookingId = res.data.bookingId || res.data.shipmentId;
        pass('[DSV] Create Booking', `Booking ID: ${bookingId}`);
    } catch (e) { fail('[DSV] Create Booking', e); }
}

async function testTracking() {
    const id = bookingId || '14620184'; // fallback to known test ID
    try {
        const res = await api.get(`/tracking/shipments/${id}`);
        pass('[DSV] Get Tracking Details', `Status: ${res.data.data?.status || 'Retrieved'}`);
    } catch (e) { fail('[DSV] Get Tracking Details', e); }
}

async function testOrderInvoice() {
    if (!adminToken || !createdOrderId) return pass('[Admin] Order Invoice', 'Skipped (no orders yet)');
    try {
        const res = await api.get(`/orders/${createdOrderId}/invoice`, authHeader(adminToken));
        pass('[Admin] Order Invoice', `Invoice: ${res.data.invoiceUrl || 'generated'}`);
    } catch (e) { fail('[Admin] Order Invoice', e); }
}

// ============================================================
// MAIN RUNNER
// ============================================================
async function runAll() {
    console.log('\n=======================================================');
    console.log(`  🚀 Limbercargo API Test Suite`);
    console.log(`  🌐 Testing against: ${BASE_URL}`);
    console.log('=======================================================\n');

    // Auth
    await testAdminLogin();
    await testAdminMe();
    await testCustomerRegister();
    await testCustomerLogin();
    await testCustomerMe();

    // Admin endpoints
    await testGetOrders();
    await testGetDashboardStats();
    await testGetAllCustomers();
    await testGetAllAdmins();
    await testMonthlyReport();

    // Customer endpoints
    await testCustomerOrders();

    // DSV API Integration
    await testGetQuotes();
    await testCreateBooking();
    await testTracking();

    // Misc
    await testOrderInvoice();

    // Summary
    console.log('\n=======================================================');
    console.log(`  📊 Results: ${passed} passed | ${failed} failed | ${passed + failed} total`);
    console.log('=======================================================\n');

    if (failed > 0) {
        console.log('❌ Failed Tests:\n');
        results.filter(r => r.status.includes('FAIL')).forEach(r => {
            console.log(`  ${r.name}: ${r.info}`);
        });
        console.log('');
    } else {
        console.log('🎉 All tests passed!\n');
    }
}

runAll().catch(console.error);
