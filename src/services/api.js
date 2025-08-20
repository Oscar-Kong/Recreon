// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine the base URL based on the platform
const getAPIUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      // Android Emulator must use 10.0.2.2 to access localhost
      return 'http://10.0.2.2:5000/api';
    } else if (Platform.OS === 'ios') {
      // iOS Simulator can use localhost directly
      return 'http://localhost:5000/api';
    }
  }
  // Production URL (replace with your actual production URL when ready)
  return 'https://your-production-api.com/api';
};

const API_URL = getAPIUrl();

// Log the URL being used (helpful for debugging)
console.log('🔗 API Configuration:', {
  platform: Platform.OS,
  url: API_URL,
  environment: __DEV__ ? 'development' : 'production'
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and debug logging
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug logging
      console.log('📤 API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method?.toUpperCase(),
        data: config.data,
        headers: config.headers
      });
      
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Check if it's a network error (no response from server)
    if (!error.response) {
      console.error('🔌 Network Error - Cannot connect to backend!');
      console.error('====================================');
      console.error('Backend URL:', API_URL);
      console.error('Platform:', Platform.OS);
      console.error('');
      console.error('Troubleshooting:');
      console.error('1. Is backend running? (npm run dev in backend folder)');
      console.error('2. Check the URL configuration:');
      console.error('   - Android Emulator: Should use 10.0.2.2:5000');
      console.error('   - iOS Simulator: Should use localhost:5000');
      console.error('3. Check backend logs for any errors');
      console.error('====================================');
      
      // Return a more user-friendly error
      const networkError = new Error('Cannot connect to server. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    // Log API errors with details
    console.error('❌ API Error Response:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing auth data');
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;