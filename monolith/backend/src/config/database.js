const { Sequelize } = require('sequelize');
const config = require('./env');

// Explicitly require mysql2 so Vercel's bundler includes it
const mysql2 = require('mysql2');

// Load simple discrete config
const { database: dbConfig } = config;

// Priority logic: 
// 1. If DATABASE_URL is explicitly set in .env, use it.
// 2. Otherwise, use discrete variables (DB_HOST, DB_NAME, etc.)
const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL && DATABASE_URL.trim() !== "") {
    console.log(`[Database] Connecting via DATABASE_URL...`);
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: dbConfig.logging,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });
} else {
    console.log(`[Database] Connecting via discrete variables (Host: ${dbConfig.host})`);
    sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            dialectModule: mysql2,
            logging: dbConfig.logging,
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
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
