import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { initializeFirebase } from './config/firebase';
import { setupSocketHandlers } from './socket';
import adminRouter from './routes/admin';

// Load env vars
dotenv.config();

// Initialize Firebase
initializeFirebase();

const app = express();
const server = http.createServer(app);

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/admin', adminRouter);

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
