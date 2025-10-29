// src/services/authService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(userData) {
    try {
      console.log('📝 Attempting registration with data:', {
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        hasPassword: !!userData.password
      });

      const response = await api.post('/auth/register', userData);
      
      console.log('✅ Registration successful:', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });

      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      // More specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw { error: 'Cannot connect to server. Check your connection and IP address.' };
      }
      
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 
                        error.response.data?.errors?.[0]?.msg || 
                        'Validation failed';
        throw { error: errorMsg };
      }

      throw error.response?.data || { error: 'Registration failed - Unknown error' };
    }
  },

  async login(username, password) {
    try {
      console.log('🔐 Attempting login for:', username);
      
      const response = await api.post('/auth/login', { username, password });
      
      console.log('✅ Login successful');

      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw { error: 'Cannot connect to server. Check your connection.' };
      }

      throw error.response?.data || { error: 'Login failed' };
    }
  },

  // ... rest of your existing methods remain the same
  async logout() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get current user' };
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
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
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to change password' };
    }
  },

  async deleteAccount() {
    try {
      const response = await api.delete('/auth/delete-account');
      await this.clearStoredData();
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete account' };
    }
  },

  async addSportProfile(sportData) {
    try {
      const response = await api.post('/auth/sport-profiles', sportData);
      // Update stored user data
      const updatedUser = await this.getCurrentUser();
      return response.data.sportProfile;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to add sport profile' };
    }
  },

  async removeSportProfile(sportId) {
    try {
      const response = await api.delete(`/auth/sport-profiles/${sportId}`);
      // Update stored user data
      await this.getCurrentUser();
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to remove sport profile' };
    }
  },

  async updateSportProfile(sportId, sportData) {
    try {
      const response = await api.put(`/auth/sport-profiles/${sportId}`, sportData);
      // Update stored user data
      await this.getCurrentUser();
      return response.data.sportProfile;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update sport profile' };
    }
  }
};