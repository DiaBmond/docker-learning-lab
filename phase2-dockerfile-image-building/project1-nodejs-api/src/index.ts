import express, { Request, Response } from 'express';
import healthRouter from './routes/health';
import { logger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(logger);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to Express API with TypeScript!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.use('/health', healthRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});