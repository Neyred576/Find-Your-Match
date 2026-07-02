import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { initializeFirebase } from './config/firebase';
import { setupSocketHandlers } from './socket';
import path from 'path';
import adminRouter from './routes/admin';
import videosRouter from './routes/videos';

// Load env vars
dotenv.config();

// Initialize Firebase
initializeFirebase();

const app = express();
const server = http.createServer(app);

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/videos', videosRouter);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupSocketHandlers(io);

// Basic route for health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', activeUsers: io.engine.clientsCount });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
