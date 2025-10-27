// src/services/matchmakingService.js
import api from './api';

/**
 * Matchmaking Service
 * 
 * Handles finding match suggestions and managing match requests
 */

export const matchmakingService = {
  /**
   * Get match suggestions based on preferences
   * @param {Object} filters - { sportId, mode, skillLevel, distance, latitude, longitude }
   * @returns {Promise<{suggestions: Array, count: number}>}
   */
  async getMatchSuggestions(filters = {}) {
    try {
      console.log('🔍 Fetching match suggestions with filters:', filters);
      
      const response = await api.get('/matchmaking/suggestions', { params: filters });
      
      console.log('✅ Match suggestions fetched:', response.data.count, 'suggestions');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching match suggestions:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Failed to fetch match suggestions' };
    }
  },

  /**
   * Send a match request to another player
   * @param {Object} requestData - { targetUserId, sportId, proposedTime, stake }
   * @returns {Promise<{challenge: Object}>}
   */
  async sendMatchRequest(requestData) {
    try {
      console.log('📤 Sending match request:', requestData);
      
      const response = await api.post('/matchmaking/request', requestData);
      
      console.log('✅ Match request sent successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error sending match request:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Failed to send match request' };
    }
  },

  /**
   * Get user's match requests
   * @param {string} type - 'sent' | 'received' | 'all'
   * @param {string} status - 'pending' | 'accepted' | 'declined' | 'expired' | 'all'
   * @returns {Promise<{requests: Array, count: number}>}
   */
  async getMatchRequests(type = 'all', status = 'pending') {
    try {
      console.log('📥 Fetching match requests:', { type, status });
      
      const response = await api.get('/matchmaking/requests', { 
        params: { type, status } 
      });
      
      console.log('✅ Match requests fetched:', response.data.count, 'requests');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching match requests:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Failed to fetch match requests' };
    }
  },

  /**
   * Respond to a match request
   * @param {number} requestId - ID of the challenge/request
   * @param {string} action - 'accept' | 'decline'
   * @returns {Promise<{challenge: Object}>}
   */
  async respondToMatchRequest(requestId, action) {
    try {
      console.log(`${action === 'accept' ? '✅' : '❌'} Responding to match request:`, requestId, action);
      
      const response = await api.put(`/matchmaking/requests/${requestId}`, { action });
      
      console.log('✅ Response sent successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error responding to match request:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Failed to respond to match request' };
    }
  },
};

export default matchmakingService;

