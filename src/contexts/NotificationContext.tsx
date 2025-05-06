
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: NotificationType;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isNotificationPanelOpen: boolean;
  addNotification: (title: string, message: string, type: NotificationType) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  toggleNotificationPanel: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((notif) => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Add a new notification
  const addNotification = useCallback((title: string, message: string, type: NotificationType) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date(),
      type,
      read: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Show toast for the new notification
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toggle notification panel
  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isNotificationPanelOpen,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        toggleNotificationPanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
