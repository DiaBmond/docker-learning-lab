import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/data', (req, res) => {
    res.json({
        message: 'Hello from optimized backend!',
        items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' }
        ]
    });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Serving frontend from /public`);
});// comment
