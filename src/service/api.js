// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Make sure this matches your backend port
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored auth data
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        // You might want to navigate to login screen here
        // This could be handled in your navigation logic
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;