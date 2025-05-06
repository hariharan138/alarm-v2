
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationTrigger = () => {
  const { unreadCount, toggleNotificationPanel } = useNotifications();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleNotificationPanel}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className={cn(
          "notification-badge",
          unreadCount > 99 ? "w-6" : ""
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationTrigger;
