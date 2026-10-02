import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket.ts';
import { useAuth } from './AuthContext.tsx';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isUserOnline: (userId: string) => boolean;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      if (user?._id) {
        s.emit('registerUser', user._id);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onOnlineList = (list: string[]) => {
      setOnlineUsers(list);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('onlineUsersList', onOnlineList);

    if (s.connected) {
      setIsConnected(true);
      if (user?._id) {
        s.emit('registerUser', user._id);
      }
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('onlineUsersList', onOnlineList);
    };
  }, [user?._id]);

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isUserOnline,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
