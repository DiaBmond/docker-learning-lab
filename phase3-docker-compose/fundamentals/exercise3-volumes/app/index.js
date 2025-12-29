const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Paths for different volume types
const NAMED_VOLUME = '/data';           // Named volume
const BIND_MOUNT_LOGS = '/app/logs';    // Bind mount
const BIND_MOUNT_CONFIG = '/etc/config'; // Bind mount
const TMPFS = '/tmp';                    // tmpfs

// Ensure directories exist
[NAMED_VOLUME, BIND_MOUNT_LOGS].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

app.use(express.json());

// Test named volume
app.post('/api/named-volume/write', (req, res) => {
    const { data } = req.body;
    const filepath = path.join(NAMED_VOLUME, 'data.txt');

    fs.writeFileSync(filepath, data + '\n', { flag: 'a' });

    res.json({
        success: true,
        type: 'named-volume',
        message: 'Data written to named volume',
        location: filepath
    });
});

app.get('/api/named-volume/read', (req, res) => {
    const filepath = path.join(NAMED_VOLUME, 'data.txt');

    if (!fs.existsSync(filepath)) {
        return res.json({
            success: false,
            message: 'No data found'
        });
    }

    const data = fs.readFileSync(filepath, 'utf8');
    res.json({
        success: true,
        type: 'named-volume',
        data: data,
        lines: data.split('\n').filter(l => l.trim()).length
    });
});

// Test bind mount (logs)
app.post('/api/bind-mount/log', (req, res) => {
    const { message } = req.body;
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    const filepath = path.join(BIND_MOUNT_LOGS, 'app.log');

    fs.appendFileSync(filepath, logEntry);

    res.json({
        success: true,
        type: 'bind-mount',
        message: 'Log written',
        location: filepath
    });
});

app.get('/api/bind-mount/logs', (req, res) => {
    const filepath = path.join(BIND_MOUNT_LOGS, 'app.log');

    if (!fs.existsSync(filepath)) {
        return res.json({
            success: false,
            message: 'No logs found'
        });
    }

    const logs = fs.readFileSync(filepath, 'utf8');
    const lines = logs.split('\n').filter(l => l.trim());

    res.json({
        success: true,
        type: 'bind-mount',
        count: lines.length,
        recent: lines.slice(-10)
    });
});

// Test bind mount (config)
app.get('/api/config', (req, res) => {
    const filepath = path.join(BIND_MOUNT_CONFIG, 'app.config.json');

    if (!fs.existsSync(filepath)) {
        return res.json({
            success: false,
            message: 'Config not found'
        });
    }

    const config = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json({
        success: true,
        type: 'bind-mount-config',
        config
    });
});

// Test tmpfs
app.post('/api/tmpfs/write', (req, res) => {
    const { data } = req.body;
    const filepath = path.join(TMPFS, 'cache.txt');

    fs.writeFileSync(filepath, data);

    res.json({
        success: true,
        type: 'tmpfs',
        message: 'Data written to tmpfs (RAM)',
        warning: 'Will be lost on container restart!'
    });
});

app.get('/api/tmpfs/read', (req, res) => {
    const filepath = path.join(TMPFS, 'cache.txt');

    if (!fs.existsSync(filepath)) {
        return res.json({
            success: false,
            message: 'No tmpfs data (might have been restarted)'
        });
    }

    const data = fs.readFileSync(filepath, 'utf8');
    res.json({
        success: true,
        type: 'tmpfs',
        data,
        warning: 'Stored in RAM, not persistent!'
    });
});

// Status endpoint
app.get('/api/status', (req, res) => {
    const status = {
        volumes: {
            named_volume: {
                path: NAMED_VOLUME,
                exists: fs.existsSync(path.join(NAMED_VOLUME, 'data.txt')),
                persistent: true
            },
            bind_mount_logs: {
                path: BIND_MOUNT_LOGS,
                exists: fs.existsSync(path.join(BIND_MOUNT_LOGS, 'app.log')),
                persistent: true,
                accessible_from_host: true
            },
            bind_mount_config: {
                path: BIND_MOUNT_CONFIG,
                exists: fs.existsSync(path.join(BIND_MOUNT_CONFIG, 'app.config.json')),
                persistent: true,
                accessible_from_host: true
            },
            tmpfs: {
                path: TMPFS,
                exists: fs.existsSync(path.join(TMPFS, 'cache.txt')),
                persistent: false,
                storage: 'RAM'
            }
        }
    };

    res.json(status);
});

app.get('/', (req, res) => {
    res.send(`
    <h1>🗄️ Volume Types Demo</h1>
    <h3>Endpoints:</h3>
    <ul>
      <li>POST /api/named-volume/write - Write to named volume</li>
      <li>GET /api/named-volume/read - Read from named volume</li>
      <li>POST /api/bind-mount/log - Write log</li>
      <li>GET /api/bind-mount/logs - View logs</li>
      <li>GET /api/config - Read config</li>
      <li>POST /api/tmpfs/write - Write to tmpfs</li>
      <li>GET /api/tmpfs/read - Read from tmpfs</li>
      <li>GET /api/status - Volume status</li>
    </ul>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Volume demo running on port ${PORT}`);
    console.log(`Named volume: ${NAMED_VOLUME}`);
    console.log(`Logs (bind): ${BIND_MOUNT_LOGS}`);
    console.log(`Config (bind): ${BIND_MOUNT_CONFIG}`);
    console.log(`tmpfs: ${TMPFS}`);
});