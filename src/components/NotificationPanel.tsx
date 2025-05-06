
import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash, X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export const NotificationPanel = () => {
  const {
    notifications,
    isNotificationPanelOpen,
    toggleNotificationPanel,
    markAllAsRead,
    markAsRead,
    clearAll,
  } = useNotifications();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNotificationPanelOpen) {
        toggleNotificationPanel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isNotificationPanelOpen, toggleNotificationPanel]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="text-notification-info" />;
      case 'success':
        return <CheckCircle className="text-notification-success" />;
      case 'warning':
        return <AlertTriangle className="text-notification-warning" />;
      case 'error':
        return <AlertCircle className="text-notification-error" />;
      default:
        return <Info className="text-notification-info" />;
    }
  };

  return (
    <>
      {/* Backdrop for mobile view */}
      {isNotificationPanelOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 md:hidden"
          onClick={toggleNotificationPanel}
        />
      )}

      {/* Notification Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-card z-50 border-l border-border shadow-lg transform transition-transform duration-300 ease-in-out',
          isNotificationPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-medium">Notifications</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all as read">
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearAll} title="Clear all">
              <Trash className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleNotificationPanel} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notification List */}
        <div className="h-full overflow-y-auto pb-20">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "notification-item", 
                    !notification.read && "bg-accent/50"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
