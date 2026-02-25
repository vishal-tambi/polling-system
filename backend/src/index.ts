import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pollRoutes from './routes/pollRoutes';
import setupPollSocket from './sockets/PollSocketHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Socket.io setup
const io = new SocketServer(httpServer, {
    cors: {
        origin: frontendUrl,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Middleware
app.use(cors({ origin: frontendUrl }));
app.use(express.json());

// Health check endpoint (for UptimeRobot)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REST routes
app.use('/api/polls', pollRoutes);

// Socket.io event handlers
setupPollSocket(io);

// Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Graceful shutdown
const shutdown = (signal: string) => {
    console.log(`${signal} signal received: closing HTTP server`);
    io.close(() => {
        console.log('Socket.io connections closed.');
        httpServer.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
