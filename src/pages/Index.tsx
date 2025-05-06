
import React from 'react';
import { AlarmDashboard } from '@/components/AlarmDashboard';
import { NotificationTrigger } from '@/components/NotificationTrigger';
import { NotificationPanel } from '@/components/NotificationPanel';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-sky-500">Alarm Dashboard</h1>
          </div>
          <div>
            <NotificationTrigger />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AlarmDashboard />
      </main>
      
      {/* Notification Panel (Outside of flow) */}
      <NotificationPanel />
    </div>
  );
};

export default Index;
