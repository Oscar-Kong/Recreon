// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// STEP 1: Find your computer's IP address
// Run this command in terminal: 
// - Windows: ipconfig (look for IPv4 Address)
// - Mac/Linux: ifconfig (look for inet under en0 or wlan0)
// Replace YOUR_COMPUTER_IP with your actual IP address
const YOUR_COMPUTER_IP = '192.168.0.79'; // ← Your actual IP from ifconfig en0

// STEP 2: Determine the correct base URL
const getAPIUrl = () => {
  if (__DEV__) {
    // Development environment - use your computer's IP address
    // This works for both iOS Simulator and Android Emulator
    return `http://${YOUR_COMPUTER_IP}:5000/api`;
  }
  // Production URL
  return 'https://your-production-api.com/api';
};

const API_URL = getAPIUrl();

// Enhanced logging to help debug
console.log('🔗 API Configuration:', {
  environment: __DEV__ ? 'development' : 'production',
  platform: Platform.OS,
  url: API_URL,
  computerIP: YOUR_COMPUTER_IP
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
      
      // Enhanced debug logging
      console.log('📤 API Request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': config.headers.Authorization ? '***TOKEN***' : 'None'
        }
      });
      
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
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
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      dataReceived: !!response.data
    });
    return response;
  },
  async (error) => {
    // Enhanced network error detection
    if (!error.response) {
      console.error('🔌 NETWORK ERROR - Cannot connect to backend!');
      console.error('====================================');
      console.error('Backend URL:', API_URL);
      console.error('Platform:', Platform.OS);
      console.error('Computer IP:', YOUR_COMPUTER_IP);
      console.error('');
      console.error('TROUBLESHOOTING STEPS:');
      console.error('1. Is your backend running?');
      console.error('   → Run: npm run dev (in backend folder)');
      console.error('');
      console.error('2. Check your computer\'s IP address:');
      console.error('   → Windows: ipconfig');
      console.error('   → Mac/Linux: ifconfig');
      console.error('   → Update YOUR_COMPUTER_IP in api.js');
      console.error('');
      console.error('3. Test the connection:');
      console.error(`   → Open browser: http://${YOUR_COMPUTER_IP}:5000/health`);
      console.error('');
      console.error('4. Check firewall settings');
      console.error('   → Allow port 5000 through firewall');
      console.error('====================================');
      
      // Return user-friendly error
      const networkError = new Error('Cannot connect to server. Please check your connection.');
      networkError.isNetworkError = true;
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }
    
    // Log API errors with full details
    console.error('❌ API Error Response:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized - clear auth data
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing auth data');
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        console.error('❌ Error clearing auth data:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;