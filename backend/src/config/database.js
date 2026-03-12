const { Sequelize } = require('sequelize');
const config = require('./env');

// Explicitly require mysql2 so Vercel's bundler includes it
const mysql2 = require('mysql2');

// detect environment
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const DATABASE_URL = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") 
    ? process.env.DATABASE_URL 
    : (process.env.DB_HOST?.startsWith('mysql://') ? process.env.DB_HOST : null);

let sequelize;

console.log(`[Database] Mode: ${isVercel ? 'Production/Vercel' : 'Development/Local'}`);

if (DATABASE_URL) {
    // 1. Connection via Full URL (Railway Public URL)
    console.log('[Database] Connecting using DATABASE_URL...');
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: config.database.logging,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else if (isVercel) {
    // 2. Connection via individual vars on Vercel (Railway Private/Individual vars)
    console.log('[Database] Connecting using individual Vercel/Railway env vars...');
    sequelize = new Sequelize(
        process.env.DB_NAME || config.database.database,
        process.env.DB_USER || config.database.username,
        process.env.DB_PASSWORD || config.database.password,
        {
            host: process.env.DB_HOST || config.database.host,
            port: process.env.DB_PORT || config.database.port,
            dialect: 'mysql',
            dialectModule: mysql2,
            logging: false,
            dialectOptions: {
                ssl: {
                    rejectUnauthorized: false
                }
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
} else {
    // 3. Connection via Local XAMPP
    console.log('[Database] Connecting to Local XAMPP...');
    sequelize = new Sequelize(
        config.database.database,
        config.database.username,
        config.database.password,
        {
            host: config.database.host,
            port: config.database.port,
            dialect: config.database.dialect,
            dialectModule: mysql2,
            logging: config.database.logging,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}


// Verify connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
