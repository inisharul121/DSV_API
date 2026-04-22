const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const authMiddleware = require('./middleware/auth');
const sequelize = require('./config/database');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Quote = require('./models/Quote');
const Admin = require('./models/Admin');
const ProformaInvoice = require('./models/ProformaInvoice');

// Establish associations (guarded to prevent duplicate registration in serverless)
if (!Order.associations.invoice) {
    Order.hasOne(ProformaInvoice, { foreignKey: 'orderId', as: 'invoice' });
    ProformaInvoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
}

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const orderController = require('./controllers/orderController');

// Serve static templates and generated files
app.use('/api/templates', express.static(path.join(__dirname, '../public/templates'))); 
app.use('/api/labels', express.static(path.join(__dirname, '../public/labels')));
app.use('/api/invoices', express.static(path.join(__dirname, '../public/invoices')));

// Serve ALL static files from the public folder (Vite frontend build)
const publicPath = path.join(__dirname, '../public');
console.log(`[Static] Serving files from: ${publicPath}`);
app.use(express.static(publicPath));

app.get('/api/labels/:filename', orderController.serveDynamicLabel);
app.get('/api/invoices/:filename', orderController.serveDynamicInvoice);

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', authMiddleware, apiRoutes);

// Root route for health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'DSV XPress API is operational', version: '2.0.0' });
});

// Fallback to index.html for React SPA (MUST be after API routes)
app.get(/.*/, (req, res) => {
    const indexPath = path.join(__dirname, '../public/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error(`[Static] Error sending index.html from: ${indexPath}`);
            res.status(404).json({ error: 'Frontend entry point missing', path: indexPath });
        }
    });
});

// Error Handling
app.use((err, req, res, next) => {
    const { logAuth } = require('./utils/logger');
    const errorMessage = err.message || 'Unknown Error';
    const errorStack = err.stack || '';

    console.error(`[GlobalError] ${errorMessage}`);
    logAuth(`[ERROR] 500 at ${req.url} - Message: ${errorMessage}`);
    if (errorStack) {
        // Log a snippet of the stack to the file too
        logAuth(`[STACK] ${errorStack.split('\n').slice(0, 3).join(' | ')}`);
    }

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: errorMessage, // Temporarily expose for debugging
        debug_hint: 'Check /logs/auth-debug.log for full stack trace'
    });
});

// Start Server or Sync Database
if (process.env.VERCEL) {
    // In Vercel environment, we just export the app
    // Database sync should be handled separately or once during initialization
    console.log('Running in Vercel environment');
    sequelize.authenticate()
        .then(() => {
            console.log('Database connected successfully (Vercel)');
            // Sync database schema on Vercel to ensure labelData column exists
            return sequelize.sync({ alter: true });
        })
        .then(() => console.log('Database synced successfully (Vercel)'))
        .catch(err => console.error('Database connection/sync failed (Vercel):', err));
} else if (require.main === module) {
    // Safer initialization: Authenticate without altering schema by default
    sequelize.authenticate()
        .then(() => {
            console.log('Database connected successfully');
            return sequelize.sync({ alter: false });
        })
        .then(() => {
            app.listen(config.port, () => {
                console.log(`[Server] Port: ${config.port}`);
                console.log(`[Server] Environment: ${config.env}`);
            });
        })
        .catch((err) => {
            console.error('Database connection failed:', err);
            // Even if DB fails, we still listen so the server at least starts
            app.listen(config.port, () => {
                console.log(`[Server] Listening on ${config.port} (DB Connection Pending)`);
            });
        });
}

module.exports = app;
