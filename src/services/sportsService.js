// src/services/sportsService.js
import api from './api';

/**
 * Sports Service
 * 
 * This service handles all API calls related to sports.
 * The sports data is mostly static/seeded data from the backend,
 * but we fetch it dynamically to ensure we always have the latest sports list.
 */

export const sportsService = {
  /**
   * Get all available sports
   * @param {string} category - Optional category filter ('racquet', 'team_court', etc.)
   * @returns {Promise<{sports: Array, count: number}>}
   */
  async getAllSports(category = null) {
    try {
      const params = category ? { category } : {};
      
      console.log('🏀 Fetching sports list', category ? `for category: ${category}` : '');
      
      const response = await api.get('/sports', { params });
      
      console.log('✅ Sports fetched:', response.data.count, 'sports');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sports:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all sport categories
   * @returns {Promise<{categories: Array, count: number}>}
   */
  async getSportCategories() {
    try {
      console.log('📂 Fetching sport categories');
      
      const response = await api.get('/sports/categories');
      
      console.log('✅ Categories fetched:', response.data.count);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get specific sport details
   * @param {number} sportId - The ID of the sport
   * @returns {Promise<{sport: Object}>}
   */
  async getSportById(sportId) {
    try {
      console.log('🎾 Fetching sport details for ID:', sportId);
      
      const response = await api.get(`/sports/${sportId}`);
      
      console.log('✅ Sport details fetched:', response.data.sport.displayName);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sport details:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get popular content for a specific sport
   * @param {number} sportId - The ID of the sport
   * @returns {Promise<{topPlayers: Array, upcomingEvents: Array}>}
   */
  async getSportPopular(sportId) {
    try {
      console.log('⭐ Fetching popular content for sport ID:', sportId);
      
      const response = await api.get(`/sports/${sportId}/popular`);
      
      console.log('✅ Popular content fetched');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching popular content:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default sportsService;