import { useEffect, useState } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);
    setIsConnected(s.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      // We don't necessarily disconnect here if we want the socket to persist across pages,
      // but for random chat, it's usually better to disconnect on unmount.
      disconnectSocket();
    };
  }, []);

  return { socket, isConnected };
};
