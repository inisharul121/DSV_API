const sequelize = require('./src/config/database');
const Order = require('./src/models/Order');

async function checkData() {
    try {
        await sequelize.authenticate();
        const count = await Order.count();
        console.log(`Connection successful. Total orders in this database: ${count}`);
        
        if (count > 0) {
            const lastOrder = await Order.findOne({ order: [['createdAt', 'DESC']] });
            console.log(`Latest Order ID: ${lastOrder.id}`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

checkData();
