import { Server, Socket } from 'socket.io';
import { Matchmaker } from './matchmaking';
import { setupAdminSocket } from './admin';

export const setupSocketHandlers = (io: Server) => {
  const matchmaker = new Matchmaker(io);
  
  // Setup admin namespace
  setupAdminSocket(io);

  io.on('connection', (socket: Socket) => {
    // console.log(`User connected: ${socket.id}`);
    
    // Add custom properties
    (socket as any).partnerId = null;
    (socket as any).type = null;
    (socket as any).blockedUsers = new Set<string>();

    socket.on('join_queue', (data: { type: 'text' | 'video' }) => {
      // Disconnect current partner if any
      const partnerId = (socket as any).partnerId;
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit('partner_disconnected');
          (partnerSocket as any).partnerId = null;
        }
        (socket as any).partnerId = null;
      }

      (socket as any).type = data.type;
      matchmaker.addToQueue(socket, data.type);
    });

    socket.on('skip', () => {
      matchmaker.skipMatch(socket);
    });

    socket.on('block', () => {
      const partnerId = (socket as any).partnerId;
      if (partnerId) {
        (socket as any).blockedUsers.add(partnerId);
      }
      matchmaker.skipMatch(socket); // Skip after blocking
    });

    socket.on('report', () => {
      // In a real app, save to DB here
      console.log(`User ${socket.id} reported partner ${(socket as any).partnerId}`);
      matchmaker.skipMatch(socket);
    });

    // Chat events
    socket.on('send_message', (text: string) => {
      const partnerId = (socket as any).partnerId;
      if (partnerId) {
        io.to(partnerId).emit('receive_message', text);
      }
    });

    socket.on('typing', () => {
      const partnerId = (socket as any).partnerId;
      if (partnerId) {
        io.to(partnerId).emit('partner_typing');
      }
    });

    // WebRTC signaling
    socket.on('webrtc_offer', (data: { target: string, offer: any }) => {
      io.to(data.target).emit('webrtc_offer', { senderId: socket.id, offer: data.offer });
    });

    socket.on('webrtc_answer', (data: { target: string, answer: any }) => {
      io.to(data.target).emit('webrtc_answer', { senderId: socket.id, answer: data.answer });
    });

    socket.on('webrtc_ice_candidate', (data: { target: string, candidate: any }) => {
      io.to(data.target).emit('webrtc_ice_candidate', { senderId: socket.id, candidate: data.candidate });
    });

    socket.on('disconnect', () => {
      const partnerId = (socket as any).partnerId;
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit('partner_disconnected');
          (partnerSocket as any).partnerId = null;
        }
      }
      matchmaker.removeFromQueue(socket);
      // console.log(`User disconnected: ${socket.id}`);
    });
  });
};
