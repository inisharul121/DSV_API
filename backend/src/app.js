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

// Serve static templates
app.use('/api/templates', express.static(path.resolve('./public/templates'))); 

// Dynamic serving & Static Fallback for runtime-generated files
app.use('/api/labels', express.static(path.resolve('./public/labels')));
app.use('/api/invoices', express.static(path.resolve('./public/invoices')));

app.get('/api/labels/:filename', orderController.serveDynamicLabel);
app.get('/api/invoices/:filename', orderController.serveDynamicInvoice);

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', authMiddleware, apiRoutes);

// Root route for health check
app.get('/', (req, res) => {
    res.json({ message: 'DSV XPress API is operational', version: '2.0.0' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: config.env === 'development' ? err.message : undefined
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
    // (Helps avoid "Too many keys" errors on Railway)
    sequelize.authenticate()
        .then(() => {
            console.log('Database connected successfully');
            
            // If you need to sync schema, uncomment the line below temporarily:
            // return sequelize.sync({ alter: true });
            return Promise.resolve();
        })
        .then(() => {
            const server = app.listen(config.port, () => {
                console.log(`Server running on port ${config.port} in ${config.env} mode`);
            });
            server.on('error', (err) => {
                console.error('Server error:', err);
            });
        })
        .catch((err) => {
            console.error('Database connection or sync failed:', err);
            app.listen(config.port, () => {
                console.log(`Server running on port ${config.port} in ${config.env} mode (DB Issue)`);
            });
        });
}

module.exports = app;
