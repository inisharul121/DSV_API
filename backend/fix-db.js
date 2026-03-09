const Admin = require('./src/models/Admin');
const sequelize = require('./src/config/database');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Check if phone column exists
        const [results] = await sequelize.query("SHOW COLUMNS FROM admins LIKE 'phone'");
        if (results.length === 0) {
            console.log('Adding phone column...');
            await sequelize.query("ALTER TABLE admins ADD COLUMN phone VARCHAR(255) NULL AFTER role");
            console.log('Phone column added');
        } else {
            console.log('Phone column already exists');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fix();
