// WebSocket-based proxy to bypass AdBlock
class WebSocketProxy {
  private ws: WebSocket | null = null;
  private messageQueue: Array<{id: string, resolve: Function, reject: Function}> = [];
  private isConnected = false;

  constructor() {
    // Don't auto-connect to avoid WebSocket errors
    // this.connect();
  }

  private connect() {
    try {
      // Use Supabase's actual WebSocket endpoint
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const projectId = supabaseUrl.split('//')[1].split('.')[0];
      const wsUrl = `wss://${projectId}.supabase.co/realtime/v1/websocket`;
      
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
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        // Don't auto-reconnect to avoid spam
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        // Don't auto-reconnect on error
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
      // For now, just reject immediately to fall back to offline storage
      // WebSocket implementation would require proper Supabase Realtime setup
      console.log('WebSocket proxy: Falling back to offline storage');
      reject(new Error('WebSocket not available - using offline storage'));
    });
  }
}

export const wsProxy = new WebSocketProxy();
