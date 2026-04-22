# 🚀 Limbercargo DSV API - Complete Project Guide (READ FIRST)

**Last Updated:** April 13, 2026 | **Status:** Production | **Domain:** www.limbercargo.com

This is the **central authority document** for all Limbercargo DSV API development. Both human developers and AI assistants MUST read and follow this before making ANY changes to ensure system stability and successful deployment.

---

# 📋 TABLE OF CONTENTS
1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Technology Stack](#-technology-stack)
4. [Development Setup](#-development-setup)
5. [Database Management](#-database-management)
6. [cPanel Hosting Guide](#-cpanel-hosting-guide)
7. [Deployment Workflow](#-deployment-workflow)
8. [For AI Assistants](#-for-ai-assistants)
9. [Common Tasks & Solutions](#-common-tasks--solutions)

---

# 🎯 PROJECT OVERVIEW

## What is Limbercargo DSV API?

Limbercargo is a shipping management platform integrated with **DSV XPress APIs**. It provides a unified interface for booking shipments, tracking packages, and comparing shipping rates across different DSV services.

**Live Site:** https://www.limbercargo.com  
**Database:** MySQL (Sequelize ORM)

### Core Capabilities

- ✅ **DSV Rate Comparator**: Real-time quote comparison across DSV services.
- ✅ **Shipment Booking**: Full integration with DSV Booking API to generate labels.
- ✅ **Tracking**: Real-time package tracking using DSV Tracking API.
- ✅ **Proforma Invoice**: Automated generation of proforma invoices for international shipping.
- ✅ **Admin Panel**: Management of orders, customers, and shipping settings.
- ✅ **Monolith Deployment**: Built for high-performance deployment on cPanel shared hosting.

---

# 🏗️ SYSTEM ARCHITECTURE

Limbercargo follows a decoupled frontend/backend architecture that is unified into a **Monolith** for deployment.

```
/Limbercargo (root)
├─ /backend                    # Express.js API
│  ├─ src/app.js               # Entry point
│  ├─ src/controllers/         # API logic (Booking, Tracking, Quotes)
│  ├─ src/models/              # Sequelize models (MySQL)
│  ├─ src/routes/              # API endpoints
│  └─ public/                  # Static assets (Labels, Invoices, Templates)
│
├─ /frontend                   # Vite + React + Tailwind
│  ├─ src/                     # React components and pages
│  ├─ public/                  # Frontend static assets
│  └─ dist/                    # Build output (copied to backend/public)
│
├─ /monolith                   # Deployment-ready unified structure
├─ sync_monolith.sh            # Packaging and sync script
└─ DATABASE_CONFIGURATION.md    # Detailed DB schema info
```

---

# 🛠️ TECHNOLOGY STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite | Latest |
| **Styling** | Tailwind CSS | 3.x |
| **Backend** | Express.js | 5.x |
| **Database ORM** | Sequelize | 6.x |
| **Database** | MySQL | 8.0+ |
| **API Integration** | DSV REST APIs | V1 & V2 |
| **PDF Generation** | PDFKit / Puppeteer | Latest |

---

# 💻 DEVELOPMENT SETUP

### Prerequisites
- Node.js 18+
- MySQL Server (Local XAMPP or Remote Staging)

### Step 1: Install Dependencies
```bash
# Install root (if any)
npm install

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Step 2: Environment Configuration
Create a `.env` file in the `backend/` directory based on `.env.example`.

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bcicz_limbercargo
DSV_BOOKING_API=https://api-test.dsv.com/xpress/booking
# ... other DSV keys
```

### Step 3: Run Development Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

# 🗄️ DATABASE MANAGEMENT

The project uses **Sequelize** for database management.

### Key Models
- `Order`: Stores shipment details and status.
- `Customer`: Customer information for shipping.
- `Quote`: Cached or historical rate comparisons.
- `ProformaInvoice`: Details for generated invoices.

### Syncing Schema
The backend is configured to sync the schema automatically on startup if `sequelize.sync({ alter: true })` is enabled in `app.js`.

---

# 🌐 SSH & PM2 DEPLOYMENT GUIDE

Since your hosting environment does not use the cPanel "Setup Node.js App" GUI, all deployments are handled via **SSH** using **PM2** for process management.

### Prerequisites
- SSH Access enabled in cPanel.
- **PM2** installed (Run `npm install -g pm2` or use local install if needed).

### Deployment Steps (SSH)

1. **Upload & Extract**
   ```bash
   # Upload the zip via File Manager or scp to ~/public_html/staging.limbercargo.com
   # Then extract it:
   unzip -o limbercargo_staging_deploy.zip -d .
   ```

2. **Install Dependencies**
   ```bash
   cd monolith/backend
   npm install --production
   ```

3. **Start Application with 200MB Memory Limit**
   To keep the process within shared hosting limits, we use both Node.js heap limits and PM2 monitor limits:
   ```bash
   pm2 start src/app.js --name "limbercargo-staging" --max-memory-restart 200M -- --max-old-space-size=200
   ```

### PM2 Essential Commands
| Command | Purpose |
|---------|---------|
| `pm2 status` | List all running apps and their memory usage |
| `pm2 logs limbercargo-staging` | View real-time error and console logs |
| `pm2 restart limbercargo-staging` | Restart the app after manual file changes |
| `pm2 stop limbercargo-staging` | Stop the app temporarily |
| `pm2 monit` | High-level dashboard of CPU/Memory usage |

---

# ⚙️ MEMORY MANAGEMENT (200MB LIMIT)

Shared hosting often kills processes that exceed memory limits. We use two strategies to stay under **200MB**:

1. **Node.js Heap Limit**: `--max-old-space-size=200`
   - This tells the Node.js Garbage Collector to run more aggressively when heap memory hits 200MB.
2. **PM2 Auto-Restart**: `--max-memory-restart 200M`
   - If the app leaks or accidentally spikes, PM2 will kill and restart it immediately to prevent a permanent "Process Killed" state from the server.

---

# 🚀 DEPLOYMENT WORKFLOW (FULL)

### 1. Build & Package (Local)
Run the sync script:
```bash
bash sync_monolith.sh
```

### 2. Upload & Deploy (SSH)
Follow the [SSH & PM2 Deployment Guide](#-ssh--pm2-deployment-guide) above.

---

# 🤖 FOR AI ASSISTANTS

- **Vite Frontend**: We use Vite, not Next.js. Build output is in `frontend/dist`.
- **Express Backend**: The backend is the main entry point. It serves APIs and (ideally) static files from `public/`.
- **DSV Integration**: API calls are handled in `backend/src/controllers/`. Be careful with DSV authentication tokens.
- **Sequelize**: Use Sequelize models for DB operations. Do not use raw SQL unless necessary.

---

# ✅ COMMON TASKS & SOLUTIONS

### Task: Add a new DSV API field
1. Update the model in `backend/src/models/`.
2. Update the controller logic in `backend/src/controllers/`.
3. Restart backend (or let nodemon do it).
4. Run migrations if necessary.

### Task: Fix label generation failing
1. Check `backend/public/labels` permissions.
2. Verify DSV API credentials in `.env`.
3. Check Puppeteer/PDFKit logs in the backend console.
