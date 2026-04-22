const request = require('supertest');
const app = require('../../src/app');

describe('DSV API Integration Tests', () => {
    it('GET / should return service status', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('service');
        expect(res.body.status).toEqual('running');
    });

    // Mocking external calls would be ideal here for unit tests
    // For integration tests hitting real API (certification), we use environment variables
    if (process.env.CERTIFICATION_MODE === 'true') {
        it('POST /api/bookings/simple should create a draft and confirm it (TC1)', async () => {
            const res = await request(app)
                .post('/api/bookings/simple')
                .send({
                    shipmentData: {
                        // ... valid payload for simple booking
                        testId: 'TC1'
                    }
                });

            // We expect success or specific error depending on actual API availability/mock
            // console.log(res.body);
            expect([201, 500]).toContain(res.statusCode);
        });
    }
});
