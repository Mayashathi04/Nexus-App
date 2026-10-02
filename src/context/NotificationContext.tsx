import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useSocket } from './SocketContext.tsx';

export interface NotificationItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
  };
  recipient: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  post?: {
    _id: string;
    caption: string;
    image: string;
  };
  read: boolean;
  createdAt: string;
}

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  avatar?: string;
  type: 'info' | 'success' | 'message';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  toasts: ToastMessage[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeToast: (id: string) => void;
  showToast: (title: string, message: string, avatar?: string, type?: 'info' | 'success' | 'message') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message: string, avatar?: string, type: 'info' | 'success' | 'message' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, avatar, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.warn('Could not refresh notifications:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshNotifications]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewMessage = (payload: any) => {
      setUnreadCount((prev) => prev + 1);
      const sender = payload.message?.sender;
      const senderName = typeof sender === 'object' ? sender.name : 'Someone';
      const senderPic = typeof sender === 'object' ? sender.profilePicture : undefined;
      showToast(
        `New Message from ${senderName}`,
        payload.message?.content || 'Sent you a message',
        senderPic,
        'message'
      );
      refreshNotifications();
    };

    socket.on('newMessageNotification', handleNewMessage);

    return () => {
      socket.off('newMessageNotification', handleNewMessage);
    };
  }, [socket, isAuthenticated, showToast, refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        toasts,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        removeToast,
        showToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
