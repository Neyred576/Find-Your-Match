import { Server, Socket } from 'socket.io';

export class Matchmaker {
  private io: Server;
  private textQueue: string[] = [];
  private videoQueue: string[] = [];

  constructor(io: Server) {
    this.io = io;
  }

  addToQueue(socket: Socket, type: 'text' | 'video') {
    this.removeFromQueue(socket); // Ensure not already in queue

    const queue = type === 'text' ? this.textQueue : this.videoQueue;
    
    // Find a valid partner
    let partnerId: string | null = null;
    let partnerIndex = -1;

    for (let i = 0; i < queue.length; i++) {
      const potentialPartnerId = queue[i];
      const blockedByMe = (socket as any).blockedUsers?.has(potentialPartnerId);
      
      const potentialPartnerSocket = this.io.sockets.sockets.get(potentialPartnerId);
      const blockedByThem = (potentialPartnerSocket as any)?.blockedUsers?.has(socket.id);

      if (!blockedByMe && !blockedByThem) {
        partnerId = potentialPartnerId;
        partnerIndex = i;
        break;
      }
    }

    if (partnerId && partnerIndex !== -1) {
      // Remove partner from queue
      queue.splice(partnerIndex, 1);
      
      // Pair them up
      this.pairUsers(socket.id, partnerId, type);
    } else {
      // No valid partner found, add to queue
      queue.push(socket.id);
    }
  }

  removeFromQueue(socket: Socket) {
    this.textQueue = this.textQueue.filter(id => id !== socket.id);
    this.videoQueue = this.videoQueue.filter(id => id !== socket.id);
  }

  private pairUsers(user1Id: string, user2Id: string, type: 'text' | 'video') {
    const s1 = this.io.sockets.sockets.get(user1Id);
    const s2 = this.io.sockets.sockets.get(user2Id);

    if (s1 && s2) {
      (s1 as any).partnerId = user2Id;
      (s2 as any).partnerId = user1Id;

      if (type === 'text') {
        s1.emit('matched', { partnerId: user2Id });
        s2.emit('matched', { partnerId: user1Id });
      } else {
        // For video, one must be initiator for WebRTC offer
        s1.emit('video_matched', { partnerId: user2Id, initiator: true });
        s2.emit('video_matched', { partnerId: user1Id, initiator: false });
      }
    }
  }

  skipMatch(socket: Socket) {
    const partnerId = (socket as any).partnerId;
    const type = (socket as any).type || 'text';

    (socket as any).partnerId = null;

    if (partnerId) {
      const partnerSocket = this.io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        (partnerSocket as any).partnerId = null;
        partnerSocket.emit('partner_disconnected');
      }
    }
    
    // Put current user back in queue
    this.addToQueue(socket, type);
  }
}
