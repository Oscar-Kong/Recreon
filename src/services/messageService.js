// src/services/messageService.js
import api from './api';

export const messageService = {
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get conversations' };
    }
  },

  async createConversation(participantIds, type = 'direct', context = 'general') {
    try {
      const response = await api.post('/messages/conversations', {
        participantIds,
        type,
        context
      });
      return response.data.conversation;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create conversation' };
    }
  },

  async getMessages(conversationId, limit = 50, before = null) {
    try {
      const params = { limit };
      if (before) params.before = before;
      
      const response = await api.get(`/messages/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get messages' };
    }
  },

  async sendMessage(conversationId, content, messageType = 'text', metadata = {}) {
    try {
      const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
        content,
        messageType,
        metadata
      });
      return response.data.message;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to send message' };
    }
  },

  async togglePin(conversationId) {
    try {
      const response = await api.put(`/messages/conversations/${conversationId}/pin`);
      return response.data.isPinned;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to toggle pin' };
    }
  },

  async deleteMessage(messageId) {
    try {
      await api.delete(`/messages/messages/${messageId}`);
      return true;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete message' };
    }
  }
};