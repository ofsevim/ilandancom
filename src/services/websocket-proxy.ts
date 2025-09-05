// WebSocket-based proxy to bypass AdBlock
class WebSocketProxy {
  private ws: WebSocket | null = null;
  private messageQueue: Array<{id: string, resolve: Function, reject: Function}> = [];
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Use a different WebSocket endpoint that might not be blocked
      const wsUrl = import.meta.env.VITE_SUPABASE_URL
        .replace('https://', 'wss://')
        .replace('http://', 'ws://')
        .replace('/rest/v1', '/realtime/v1/websocket');
      
      console.log('Attempting WebSocket connection to:', wsUrl);
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.processQueue();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        // Reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  private handleMessage(data: any) {
    // Handle WebSocket messages
    const message = this.messageQueue.find(m => m.id === data.id);
    if (message) {
      if (data.error) {
        message.reject(new Error(data.error));
      } else {
        message.resolve(data.result);
      }
      this.messageQueue = this.messageQueue.filter(m => m.id !== data.id);
    }
  }

  private processQueue() {
    if (this.isConnected && this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws) {
        this.ws.send(JSON.stringify({
          id: message.id,
          type: 'update_ad',
          data: message.data
        }));
      }
    }
  }

  async updateAd(id: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substr(2, 9);
      
      this.messageQueue.push({
        id: messageId,
        resolve,
        reject
      });
      
      if (this.isConnected) {
        this.processQueue();
      } else {
        // Fallback to HTTP if WebSocket not available
        reject(new Error('WebSocket not available'));
      }
    });
  }
}

export const wsProxy = new WebSocketProxy();
