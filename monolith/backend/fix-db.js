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
        
        // 1. Get all indexes for the orders table
        const [indexes] = await sequelize.query("SHOW INDEX FROM `orders` WHERE Key_name != 'PRIMARY'");
        
        // 2. Identify redundant indexes
        // We want to keep foreign keys but remove the duplicates that alter:true creates
        const toDrop = indexes.filter(idx => 
            idx.Column_name === 'bookingId' || 
            idx.Key_name.includes('bookingId') ||
            (idx.Non_unique === 0 && idx.Key_name !== 'PRIMARY') // All unique indexes that aren't primary
        );

        if (toDrop.length === 0) {
            console.log('✨ No redundant indexes found.');
        } else {
            console.log(`🔍 Found ${toDrop.length} indexes to clean up.`);
            
            // Generate unique names to drop (duplicates might appear in list if composite)
            const uniqueKeyNames = [...new Set(toDrop.map(idx => idx.Key_name))];
            
            for (const keyName of uniqueKeyNames) {
                console.log(`🗑️ Dropping index: ${keyName}`);
                try {
                    await sequelize.query(`ALTER TABLE \`orders\` DROP INDEX \`${keyName}\``);
                } catch (e) {
                    console.error(`  ❌ Failed to drop ${keyName}: ${e.message}`);
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
