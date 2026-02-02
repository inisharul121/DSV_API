# DSV XPress Integration - Development Guide

## Project Setup
1. **Install Dependencies**: `npm install`
2. **Environment Variables**: Copy `.env.example` to `.env` and fill in your DSV credentials.
   ```bash
   cp .env.example .env
   ```

## Running the Application
- **Development Mode**: `npm run dev` (uses nodemon)
- **Production Mode**: `npm start`
- **Run Tests**: `npm test`

## Frontend Interface
- **Dashboard**: `http://localhost:3001/`
- **Booking Form**: `http://localhost:3001/booking.html`
- **Tracking**: `http://localhost:3001/tracking.html`

## API Endpoints (Local)
- **Status Check**: `GET http://localhost:3001/api/status`
- **Simple Booking**: `POST http://localhost:3001/api/bookings/simple`
- **Complex Booking**: `POST http://localhost:3001/api/bookings/complex`
- **Upload Document**: `POST http://localhost:3001/api/bookings/:draftId/documents`
- **Tracking**: `GET http://localhost:3001/api/shipments/:shipmentId/tracking`

## Certification Process
To run certification tests:
1. Set `CERTIFICATION_MODE=true` in `.env`.
2. Update `CERTIFICATION_TEST_ID` in `.env` or pass it in the request payload (if supported by controller).
3. Run specific test scenarios or use the integration test suite.

## Project Structure
- `src/controllers`: Core logic
- `src/middleware`: Auth and Cert middleware
- `src/config`: API clients and env vars
- `public/labels`: Generated labels
