const sequelize = require('./src/config/database');
const Order = require('./src/models/Order');
const Customer = require('./src/models/Customer');
const Quote = require('./src/models/Quote');
const Admin = require('./src/models/Admin');
const ProformaInvoice = require('./src/models/ProformaInvoice');

// Establish associations
Order.hasOne(ProformaInvoice, { foreignKey: 'orderId', as: 'invoice' });
ProformaInvoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

async function syncDatabase() {
    try {
        console.log('🚀 Starting Database Sync (Alter Mode)...');
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // This will update the schema to match the models (add missing columns)
        await sequelize.sync({ alter: true });
        console.log('✅ Database schema updated successfully.');

        console.log('\n🏁 Sync complete. You can now try accessing the dashboard again.');
    } catch (error) {
        console.error('❌ Database sync failed:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

syncDatabase();
