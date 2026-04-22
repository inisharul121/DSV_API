const sequelize = require('./src/config/database');

/**
 * Fix script to resolve "Too many keys" error (ER_TOO_MANY_KEYS)
 * This script identifies and drops redundant indexes on the orders table.
 */
async function fixOrdersTable() {
    try {
        console.log('🚀 Starting Database Index Cleanup...');
        await sequelize.authenticate();
        console.log('✅ Connected to database.');
        
        const tables = ['orders', 'admins', 'customers'];
        
        for (const tableName of tables) {
            console.log(`\n🔍 Checking table: ${tableName}`);
            // 1. Get all indexes for the table
            const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\` WHERE Key_name != 'PRIMARY'`);
            
            // 2. Identify redundant indexes
            // We want to keep foreign keys but remove the duplicates that alter:true creates
            // Duplicates usually have names like 'email_2', 'email_3' or 'bookingId_2'
            const toDrop = indexes.filter(idx => 
                idx.Key_name.includes('_') && !isNaN(idx.Key_name.split('_').pop()) || // e.g. email_2
                (tableName === 'orders' && (idx.Column_name === 'bookingId' || idx.Key_name.includes('bookingId'))) ||
                (tableName === 'admins' && (idx.Column_name === 'email' || idx.Key_name.includes('email'))) ||
                (tableName === 'customers' && (idx.Column_name === 'email' || idx.Key_name.includes('email')))
            );

            if (toDrop.length === 0) {
                console.log(`  ✨ No redundant indexes found in ${tableName}.`);
            } else {
                console.log(`  🔍 Found ${toDrop.length} index entries to clean up in ${tableName}.`);
                
                // Generate unique names to drop
                const uniqueKeyNames = [...new Set(toDrop.map(idx => idx.Key_name))];
                
                for (const keyName of uniqueKeyNames) {
                    console.log(`  🗑️ Dropping index: ${keyName}`);
                    try {
                        await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${keyName}\``);
                    } catch (e) {
                        console.error(`    ❌ Failed to drop ${keyName}: ${e.message}`);
                    }
                }
            }
        }

        console.log('\n🏁 Cleanup complete. You can now try: npm run dev');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

fixOrdersTable();
