// src/services/socketService.js
import io from 'socket.io-client';
import { authService } from './authService';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    try {
      const token = await authService.getToken();
      if (!token) {
        console.error('No auth token for socket connection');
        return false;
      }

      const SOCKET_URL = __DEV__ 
        ? 'http://localhost:5000' 
        : 'https://your-production-api.com';

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupBaseListeners();
      return true;
    } catch (error) {
      console.error('Socket connection error:', error);
      return false;
    }
  }

  setupBaseListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected the client, try to reconnect manually
        setTimeout(() => this.reconnect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  async reconnect() {
    if (!this.isConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log('Attempting to reconnect socket...');
      await this.connect();
    }
  }

  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  joinConversation(conversationId) {
    if (this.isSocketConnected()) {
      this.socket.emit('join_conversation', conversationId);
      console.log(`Joined conversation: ${conversationId}`);
    } else {
      console.warn('Socket not connected, cannot join conversation');
    }
  }

  leaveConversation(conversationId) {
    if (this.isSocketConnected()) {
      this.socket.emit('leave_conversation', conversationId);
      console.log(`Left conversation: ${conversationId}`);
    }
  }

  sendMessage(messageData) {
    if (this.isSocketConnected()) {
      this.socket.emit('send_message', messageData);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  startTyping(conversationId, userId) {
    if (this.isSocketConnected()) {
      this.socket.emit('typing_start', { conversationId, userId });
    }
  }

  stopTyping(conversationId, userId) {
    if (this.isSocketConnected()) {
      this.socket.emit('typing_stop', { conversationId, userId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listeners for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
    } else {
      console.warn(`Cannot add listener for ${event}: socket not initialized`);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from listeners tracking
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
        
        // Clean up empty event sets
        if (this.listeners.get(event).size === 0) {
          this.listeners.delete(event);
        }
      }
    }
  }

  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      
      // Clean up from our tracking
      if (event) {
        this.listeners.delete(event);
      } else {
        this.listeners.clear();
      }
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      
      // Remove all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
      
      // Disconnect and clean up
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Utility method to check if specific event has listeners
  hasListeners(event) {
    return this.listeners.has(event) && this.listeners.get(event).size > 0;
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      socket: !!this.socket,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;