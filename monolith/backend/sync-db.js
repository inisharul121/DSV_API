const sequelize = require('./src/config/database');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Quote = require('./models/Quote');
const Admin = require('./models/Admin');
const ProformaInvoice = require('./models/ProformaInvoice');

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
