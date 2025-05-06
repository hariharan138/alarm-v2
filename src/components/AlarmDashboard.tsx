import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNotifications } from '@/contexts/NotificationContext';
import wsService from '@/services/WebSocketService';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';

interface AlarmRecord {
  id: string;
  timestamp: string;
}

export const AlarmDashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [alarmRecords, setAlarmRecords] = useState<AlarmRecord[]>([]);
  const { addNotification } = useNotifications();
  const prevRecordsRef = useRef<string[]>([]);
  
  useEffect(() => {
    // Handle connection status changes
    const handleConnectionStatus = (status: 'connected' | 'disconnected' | 'error') => {
      setConnectionStatus(status);
      
      if (status === 'connected') {
        addNotification('Connection Established', 'Successfully connected to the alarm monitoring system.', 'success');
      } else if (status === 'disconnected') {
        addNotification('Connection Lost', 'Disconnected from the alarm monitoring system. Attempting to reconnect...', 'warning');
      } else if (status === 'error') {
        addNotification('Connection Error', 'Failed to connect to the alarm monitoring system.', 'error');
      }
    };
    
    // Handle incoming alarm messages
    const handleMessage = (message: any) => {
      if (message.type === 'alarm-records') {
        // Keep track of the previous record IDs to detect new alarms
        const currentRecordIds = prevRecordsRef.current;
        const newRecords = message.records.slice(0, 5);
        const newRecordIds = newRecords.map((rec: AlarmRecord) => rec.id);
        
        // Find new alarms (IDs that weren't in the previous set)
        const newAlarmIds = newRecordIds.filter((id: string) => !currentRecordIds.includes(id));
        
        // Update state with new records
        setAlarmRecords(newRecords);
        
        // Update ref with current IDs for next comparison
        prevRecordsRef.current = newRecordIds;
        
        // Notify for new alarms
        if (newAlarmIds.length > 0) {
          addNotification(
            `${newAlarmIds.length} New Alarm${newAlarmIds.length > 1 ? 's' : ''}`, 
            `${newAlarmIds.length} new alarm${newAlarmIds.length > 1 ? 's have' : ' has'} been detected.`,
            'warning'
          );
        }
      }
    };
    
    // Add event listeners
    wsService.addConnectionStatusListener(handleConnectionStatus);
    wsService.addMessageListener(handleMessage);
    
    // Connect to the WebSocket server
    wsService.connect();
    
    // Cleanup
    return () => {
      wsService.removeConnectionStatusListener(handleConnectionStatus);
      wsService.removeMessageListener(handleMessage);
      wsService.disconnect();
    };
  }, [addNotification]);
  
  // Determine the status display
  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { 
          icon: <Bell className="h-4 w-4 animate-pulse" />, 
          text: 'Connecting to alarm system...',
          className: 'bg-muted'
        };
      case 'connected':
        return { 
          icon: <CheckCircle className="h-4 w-4 text-notification-success" />, 
          text: 'Connected to alarm system',
          className: 'bg-green-50 text-green-800 border-green-200'
        };
      case 'disconnected':
        return { 
          icon: <AlertTriangle className="h-4 w-4 text-notification-warning" />, 
          text: 'Disconnected from alarm system. Attempting to reconnect...',
          className: 'bg-yellow-50 text-yellow-800 border-yellow-200'
        };
      case 'error':
        return { 
          icon: <AlertTriangle className="h-4 w-4 text-notification-error" />, 
          text: 'Failed to connect to alarm system',
          className: 'bg-red-50 text-red-800 border-red-200'
        };
      default:
        return { 
          icon: <Bell className="h-4 w-4" />, 
          text: 'Unknown connection status',
          className: 'bg-muted'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Live Alarm Dashboard
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Alert className={cn("mb-6", statusDisplay.className)}>
          <AlertTitle className="flex items-center gap-2">
            {statusDisplay.icon}
            Connection Status
          </AlertTitle>
          <AlertDescription>{statusDisplay.text}</AlertDescription>
        </Alert>
        
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {alarmRecords.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                    No alarm records to display
                  </td>
                </tr>
              ) : (
                alarmRecords.map((record, index) => (
                  <tr 
                    key={record.id}
                    className={cn(
                      'alarm-row',
                      index === 0 && !prevRecordsRef.current.includes(record.id) && 'alarm-row-new'
                    )}
                  >
                    <td className="px-4 py-3 border-t">{record.id}</td>
                    <td className="px-4 py-3 border-t">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlarmDashboard;
