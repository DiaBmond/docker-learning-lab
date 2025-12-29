const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuration
const PORT = process.env.API_PORT;
const NODE_ENV = process.env.NODE_ENV;
const MESSAGE = process.env.MESSAGE;
const APP_NAME = process.env.APP_NAME;
const VERSION = process.env.VERSION;
const LOG_FILE = process.env.LOG_FILE;

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    // Write to console
    console.log(logMessage.trim());

    // Write to file
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
        console.error('Failed to write log:', err.message);
    }
}

// Startup log
log(`${APP_NAME} v${VERSION} starting...`, 'INFO');
log(`Environment: ${NODE_ENV}`, 'INFO');
log(`Log file: ${LOG_FILE}`, 'INFO');

// Middleware to log requests
app.use((req, res, next) => {
    log(`${req.method} ${req.path} from ${req.ip}`, 'REQUEST');
    next();
});

app.get('/api/health', (req, res) => {
    log('Health check requested', 'INFO');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'backend',
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

app.get('/api/data', (req, res) => {
    log('Data endpoint requested', 'INFO');
    res.json({
        message: MESSAGE,
        app: APP_NAME,
        version: VERSION,
        environment: NODE_ENV,
        items: [
            { id: 1, name: 'Docker' },
            { id: 2, name: 'Compose' },
            { id: 3, name: 'Multi-container' }
        ]
    });
});

app.get('/api/env', (req, res) => {
    log('Environment endpoint requested', 'INFO');
    res.json({
        NODE_ENV,
        API_PORT: PORT,
        MESSAGE,
        APP_NAME,
        VERSION,
        LOG_FILE,
        platform: process.platform,
        nodeVersion: process.version
    });
});

// New endpoint: View logs
app.get('/api/logs', (req, res) => {
    try {
        const logs = fs.readFileSync(LOG_FILE, 'utf-8');
        const lines = logs.split('\n').filter(l => l.trim());

        // Get last 50 lines
        const recentLogs = lines.slice(-50);

        res.json({
            total: lines.length,
            showing: recentLogs.length,
            logs: recentLogs
        });
    } catch (err) {
        log(`Error reading logs: ${err.message}`, 'ERROR');
        res.status(500).json({
            error: 'Failed to read logs',
            message: err.message
        });
    }
});

// New endpoint: Simulate crash (for testing restart)
app.get('/api/crash', (req, res) => {
    log('Crash endpoint called - shutting down in 2 seconds...', 'WARN');
    res.json({
        message: 'Server will crash in 2 seconds...',
        restart_policy: 'unless-stopped'
    });

    setTimeout(() => {
        log('Simulating crash!', 'ERROR');
        process.exit(1);  // Exit with error code
    }, 2000);
});

// New endpoint: Graceful shutdown
app.get('/api/shutdown', (req, res) => {
    log('Graceful shutdown requested', 'WARN');
    res.json({
        message: 'Shutting down gracefully...'
    });

    setTimeout(() => {
        log('Graceful shutdown complete', 'INFO');
        process.exit(0);  // Exit cleanly
    }, 1000);
});

// Error handling
app.use((err, req, res, next) => {
    log(`Error: ${err.message}`, 'ERROR');
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
    log(`Server running on port ${PORT}`, 'INFO');
    log(`Ready to accept connections`, 'INFO');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully...', 'INFO');
    process.exit(0);
});