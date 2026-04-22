const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars - Try multiple locations for monolith compatibility
const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env')
];

let loaded = false;
for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
        console.log(`[Env] Loaded successfully from: ${envPath}`);
        loaded = true;
        break;
    }
}

if (!loaded) {
    console.warn('[Env] Warning: No .env file found in any expected location.');
}

const config = {
    database: process.env.DB_NAME || 'dsv_shipping_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
};

// Priority logic: 
// 1. If DATABASE_URL is explicitly set in .env, use it.
// 2. Otherwise, use discrete variables (DB_HOST, DB_NAME, etc.)
const DATABASE_URL = process.env.DATABASE_URL;

console.log('--- Database Connection Test ---');

let sequelize;

if (DATABASE_URL && DATABASE_URL.trim() !== "") {
    console.log(`Connecting via DATABASE_URL...`);
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'mysql',
        logging: console.log,
    });
} else {
    console.log(`Connecting via discrete variables:`);
    console.log(`Host: ${config.host}`);
    console.log(`Port: ${config.port}`);
    console.log(`User: ${config.username}`);
    console.log(`Database: ${config.database}`);
    
    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: console.log,
    });
}

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('\n✅ Connection has been established successfully.');
        
        // Optional: Show tables
        const [results] = await sequelize.query("SHOW TABLES");
        console.log('\nTables in database:');
        console.table(results);

        // Show indexes for orders
        console.log('\n--- Indexes on [orders] table ---');
        const [indexes] = await sequelize.query("SHOW INDEX FROM `orders` ");
        console.table(indexes.map(idx => ({
            Table: idx.Table,
            Column: idx.Column_name,
            Key_name: idx.Key_name,
            Unique: idx.Non_unique === 0
        })));
        
    } catch (error) {
        console.error('\n❌ Unable to connect to the database:');
        console.error(error.message);
        
        if (error.original) {
            console.error('Original error code:', error.original.code);
        }
    } finally {
        await sequelize.close();
        process.exit();
    }
}

testConnection();
