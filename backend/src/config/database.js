const { Sequelize } = require('sequelize');
const config = require('./env');

// Explicitly require mysql2 so Vercel's bundler includes it
const mysql2 = require('mysql2');

// Railway provides DATABASE_URL as a full mysql:// connection string.
// We also check DB_HOST in case the user pasted the full URL there (as seen in screenshots).
const DATABASE_URL = process.env.DATABASE_URL || (process.env.DB_HOST?.startsWith('mysql://') ? process.env.DB_HOST : null);

let sequelize;

if (DATABASE_URL) {
    // Full URL mode (Railway / other managed DBs)
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: config.database.logging,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false  // Required for Railway's SSL certificate
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Individual vars mode (local XAMPP / custom config)
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
