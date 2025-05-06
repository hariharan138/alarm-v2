
import { Notification } from '@/contexts/NotificationContext';

interface AlarmRecord {
  id: string;
  timestamp: string;
}

interface Message {
  type: string;
  records: AlarmRecord[];
}

type ConnectionStatusListener = (status: 'connected' | 'disconnected' | 'error') => void;
type MessageListener = (message: Message) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private connectionStatusListeners: ConnectionStatusListener[] = [];
  private messageListeners: MessageListener[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  
  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.notifyConnectionStatusListeners('connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyMessageListeners(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.notifyConnectionStatusListeners('disconnected');
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionStatusListeners('error');
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.notifyConnectionStatusListeners('error');
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  addConnectionStatusListener(listener: ConnectionStatusListener): void {
    this.connectionStatusListeners.push(listener);
  }

  removeConnectionStatusListener(listener: ConnectionStatusListener): void {
    this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
  }

  addMessageListener(listener: MessageListener): void {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener: MessageListener): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  private notifyConnectionStatusListeners(status: 'connected' | 'disconnected' | 'error'): void {
    this.connectionStatusListeners.forEach(listener => listener(status));
  }

  private notifyMessageListeners(message: Message): void {
    this.messageListeners.forEach(listener => listener(message));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }
}

// Create a singleton instance
const wsService = new WebSocketService('https://ws2relayserver.loca.lt');

export default wsService;
