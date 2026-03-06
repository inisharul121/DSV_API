const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const authMiddleware = require('./middleware/auth');
const sequelize = require('./config/database');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (labels, invoices)
app.use('/api/labels', express.static(path.resolve('./public/labels')));
app.use('/api/invoices', express.static(path.resolve('./public/invoices')));

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

// Start Server with Database Sync
if (require.main === module) {
    sequelize.sync({ alter: false })
        .then(() => {
            console.log('Database synced successfully');
            const server = app.listen(config.port, () => {
                console.log(`Server running on port ${config.port} in ${config.env} mode`);
            });
            server.on('error', (err) => {
                console.error('Server error:', err);
            });
        })
        .catch((err) => {
            console.error('Failed to sync database:', err);
            // Still start the server if DB fails, or handle as needed
            app.listen(config.port, () => {
                console.log(`Server running on port ${config.port} in ${config.env} mode (DB Sync Failed)`);
            });
        });
}

module.exports = app;
