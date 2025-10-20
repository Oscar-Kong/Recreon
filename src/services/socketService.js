// src/services/socketService.js
import io from 'socket.io-client';
import { authService } from './authService';
import { API_CONFIG } from '../config/api';

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

      console.log('🔌 Connecting to socket:', API_CONFIG.SOCKET_URL);

      this.socket = io(API_CONFIG.SOCKET_URL, {
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
      console.log('✅ Socket connected to:', API_CONFIG.SOCKET_URL);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        setTimeout(() => this.reconnect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  async reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log('🔄 Attempting to reconnect socket...');
      await this.connect();
    }
  }

  // ============================================
  // CRITICAL: Event Listener Methods (on/off)
  // ============================================
  
  /**
   * Register an event listener
   * This wraps socket.io's 'on' method
   */
  on(eventName, callback) {
    if (!this.socket) {
      console.warn(`Cannot listen to '${eventName}': Socket not connected`);
      return;
    }

    // Store the callback for cleanup later
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);

    // Register with socket.io
    this.socket.on(eventName, callback);
    console.log(`📡 Listening to event: ${eventName}`);
  }

  /**
   * Unregister an event listener
   * This wraps socket.io's 'off' method
   */
  off(eventName, callback) {
    if (!this.socket) {
      return;
    }

    // Remove from our listeners map
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // Clean up empty arrays
      if (callbacks.length === 0) {
        this.listeners.delete(eventName);
      }
    }

    // Unregister from socket.io
    this.socket.off(eventName, callback);
    console.log(`📡 Stopped listening to event: ${eventName}`);
  }

  /**
   * Emit an event (send data to server)
   */
  emit(eventName, data) {
    if (!this.socket) {
      console.warn(`Cannot emit '${eventName}': Socket not connected`);
      return;
    }
    
    this.socket.emit(eventName, data);
  }

  // ============================================
  // Conversation Methods
  // ============================================

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
      console.log(`📥 Joined conversation: ${conversationId}`);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
      console.log(`📤 Left conversation: ${conversationId}`);
    }
  }

  sendMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', data);
      console.log(`📨 Sent message to conversation: ${data.conversationId}`);
    }
  }

  // ============================================
  // Typing Indicators
  // ============================================

  startTyping(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId, userId });
    }
  }

  stopTyping(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId, userId });
    }
  }

  // ============================================
  // Connection Management
  // ============================================

  disconnect() {
    if (this.socket) {
      // Clean up all listeners
      this.listeners.forEach((callbacks, eventName) => {
        callbacks.forEach(callback => {
          this.socket.off(eventName, callback);
        });
      });
      this.listeners.clear();

      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('👋 Socket disconnected and cleaned up');
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasSocket: !!this.socket,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export a singleton instance
export const socketService = new SocketService();