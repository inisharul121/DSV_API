# DSV XPress API & Shipping Wizard

A modern, full-stack web application designed for seamless integration with DSV Shipping APIs. This project provides a comprehensive dashboard for managing shipments, a streamlined 3-step shipping wizard, real-time tracking, and standalone label retrieval.

## 🚀 Key Features

- **Interactive Dashboard**: Real-time stats cards for active shipments, deliveries, and exceptions, plus volume analytics.
- **Enhanced Shipping Wizard**: A simplified 3-step process:
  - **Step 1: Delivery Options**: Quick rate calculation based on country, weight, and direction (Export/Import).
  - **Step 2: Box Size**: dimension input with common presets (A4, Shoe Box, etc.).
  - **Step 3: Booking**: Deep integration with DSV's complex booking schema (8+ specialized sections).
- **Unified Tracking**: Track shipments using DSV IDs, AWB numbers, or Carrier references with a visual timeline.
- **Standalone Labels**: Dedicated page for retrieving and downloading PDF shipping labels by ID.
- **Management Modules**: Searchable directories for Quotes, Staff, and Customers.
- **Responsive Design**: Built with React and Vanilla CSS for a premium, fast-loading experience.

## 📁 Folder Structure

```text
DSV_API/
├── backend/                # Express.js API Server
│   ├── src/
│   │   ├── config/        # API configurations and environment setup
│   │   ├── controllers/   # Business logic for bookings, tracking, etc.
│   │   ├── middleware/    # Security (Helmet, CORS) and Certification
│   │   ├── routes/        # API endpoint definitions
│   │   └── utils/         # Payload builders and formatters
│   ├── .env               # Backend environment variables
│   └── package.json
├── frontend/               # React (Vite) Application
│   ├── src/
│   │   ├── api/           # Axios instance for backend communication
│   │   ├── components/    # Reusable UI parts and Wizard steps
│   │   ├── pages/         # Main views (Dashboard, Shipments, etc.)
│   │   ├── utils/         # Helpers and constants (Country lists)
│   │   └── App.jsx        # Routing configuration
│   ├── .env               # Frontend environment variables
│   └── package.json
└── README.md               # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with your DSV credentials:
```env
PORT=3001
DSV_SUBSCRIPTION_KEY=your_key
DSV_SERVICE_AUTH=your_auth
DSV_PAT=your_pat
# ... refer to .env.example if available
```
Run the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:3001/api
```
Run the frontend:
```bash
npm run dev
```

## 🛡️ Security & Performance
- **Helmet**: Secured HTTP headers in the backend.
- **CORS**: Configured for secure frontend-backend communication.
- **Lucide React**: Lightweight and consistent iconography.
- **Payload Validation**: Automatic phone and date formatting for DSV API compliance.
