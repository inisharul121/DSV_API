const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../logs/auth-debug.log');

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

exports.logAuth = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // Log to console for dev
    console.log(`[AuthDebug] ${message}`);
    
    // Log to file for production debugging
    fs.appendFileSync(LOG_FILE, logMessage);
};
