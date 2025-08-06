// src/services/authService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  async logout() {
    try {
      // Clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Optional: Call backend logout endpoint if you have one
      // await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      // Update stored user data with fresh data from server
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get current user' };
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { error: 'Profile update failed' };
    }
  },

  async getStoredUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async clearStoredData() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }
};