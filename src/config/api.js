// src/config/api.js
import { Platform } from 'react-native';

const getLocalIPAddress = () => {
  // Replace this with your computer's actual IP address
  // Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
  return '172.20.10.4'; // ← Change this to your IP
};

export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? `http://${getLocalIPAddress()}:5000/api`
    : 'https://your-production-api.com/api',
  
  SOCKET_URL: __DEV__
    ? `http://${getLocalIPAddress()}:5000`
    : 'https://your-production-api.com',
    
  // For development debugging
  TIMEOUT: 10000,
  
  // Helpful for different environments
  get FULL_BASE_URL() {
    return this.BASE_URL.replace('/api', '');
  }
};

// Development helper
if (__DEV__) {
  console.log('🔧 API Config:', {
    baseUrl: API_CONFIG.BASE_URL,
    socketUrl: API_CONFIG.SOCKET_URL,
    platform: Platform.OS
  });
}