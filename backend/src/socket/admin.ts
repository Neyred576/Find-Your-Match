import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupAdminSocket = (io: Server) => {
  const adminNamespace = io.of('/admin');

  adminNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  adminNamespace.on('connection', (socket) => {
    // console.log('Admin connected to dashboard');
    
    // Broadcast stats immediately upon connection
    broadcastStats(io, adminNamespace);

    socket.on('disconnect', () => {
      // console.log('Admin disconnected');
    });
  });

  // Set up an interval to broadcast stats to all connected admins
  setInterval(() => {
    broadcastStats(io, adminNamespace);
  }, 2000);
};

const broadcastStats = (io: Server, adminNamespace: any) => {
  let textChatters = 0;
  let videoChatters = 0;
  let waitingUsers = 0;

  // We have to compute stats manually across all sockets
  const sockets = Array.from(io.sockets.sockets.values());
  const totalUsers = sockets.length;

  sockets.forEach((s: any) => {
    if (s.partnerId) {
      if (s.type === 'text') textChatters++;
      else if (s.type === 'video') videoChatters++;
    } else if (s.type) {
      waitingUsers++;
    }
  });

  adminNamespace.emit('stats_update', {
    totalUsers,
    textChatters,
    videoChatters,
    waitingUsers,
  });
};
