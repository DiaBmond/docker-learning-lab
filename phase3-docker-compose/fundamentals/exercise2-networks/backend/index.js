const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Database connection
const pool = new Pool({
    host: 'database',  // ← Service name!
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'secret'
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected at:', res.rows[0].now);
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'backend',
        network: 'accessible from frontend',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        res.json({
            count: result.rows.length,
            users: result.rows
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/network-test', async (req, res) => {
    const tests = {
        database: { accessible: false, error: null },
        frontend: { accessible: false, error: null }
    };

    // Test database connection
    try {
        await pool.query('SELECT 1');
        tests.database.accessible = true;
    } catch (err) {
        tests.database.error = err.message;
    }

    // Test frontend connection (should fail - different network)
    try {
        const http = require('http');
        await new Promise((resolve, reject) => {
            http.get('http://frontend:80', resolve).on('error', reject);
        });
        tests.frontend.accessible = true;
    } catch (err) {
        tests.frontend.error = err.message;
    }

    res.json(tests);
});

app.get('/api/network-test', async (req, res) => {
    const tests = {
        database: {
            accessible: false,
            error: null,
            reason: 'Backend should access database (private network)'
        },
        frontend: {
            accessible: false,
            error: null,
            reason: 'Backend should access frontend (public network)'
        },
        internet: {
            accessible: false,
            error: null,
            reason: 'Backend should access internet'
        }
    };

    // Test database connection (should work)
    try {
        await pool.query('SELECT 1');
        tests.database.accessible = true;
    } catch (err) {
        tests.database.error = err.message;
    }

    // Test frontend connection (should work - same public network)
    try {
        const http = require('http');
        await new Promise((resolve, reject) => {
            const req = http.get('http://frontend:80', (res) => {
                resolve();
            });
            req.on('error', reject);
            req.setTimeout(2000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
        tests.frontend.accessible = true;
    } catch (err) {
        tests.frontend.error = err.message;
    }

    // Test internet connection (should work)
    try {
        const https = require('https');
        await new Promise((resolve, reject) => {
            const req = https.get('https://www.google.com', (res) => {
                resolve();
            });
            req.on('error', reject);
            req.setTimeout(3000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
        tests.internet.accessible = true;
    } catch (err) {
        tests.internet.error = err.message;
    }

    res.json({
        summary: {
            backend_to_database: tests.database.accessible ? '✅ Connected' : '❌ Failed',
            backend_to_frontend: tests.frontend.accessible ? '✅ Connected' : '❌ Failed',
            backend_to_internet: tests.internet.accessible ? '✅ Connected' : '❌ Failed'
        },
        details: tests,
        explanation: {
            architecture: 'Backend is in BOTH public and private networks',
            public_network: 'Backend ←→ Frontend',
            private_network: 'Backend ←→ Database',
            isolation: 'Frontend ⛔ Database (no shared network)'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend API running on port ${PORT}`);
    console.log(`📡 Networks: public (frontend) + private (database)`);
});