// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';

console.log('📡 Initializing API Service with:', API_CONFIG.BASE_URL);

// ========================================
// AXIOS INSTANCE CONFIGURATION
// ========================================

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
  async (config) => {
    try {
      // Attach authentication token if available
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Development logging
      if (__DEV__) {
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          fullURL: `${config.baseURL}${config.url}`,
          hasToken: !!token,
          hasData: !!config.data,
        });
      }
      
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request configuration error:', error);
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(
  (response) => {
    // Success response logging
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
      });
    }
    
    return response;
  },
  async (error) => {
    // ========================================
    // NETWORK ERROR HANDLING
    // ========================================
    
    if (!error.response) {
      console.error('═══════════════════════════════════════');
      console.error('🔌 NETWORK ERROR - Cannot connect to backend');
      console.error('═══════════════════════════════════════');
      console.error('Target URL:', API_CONFIG.BASE_URL);
      console.error('Platform:', Platform.OS);
      console.error('');
      console.error('📋 TROUBLESHOOTING CHECKLIST:');
      console.error('');
      console.error('1. ✓ Is your backend running?');
      console.error('   Run: cd backend && npm run dev');
      console.error('   Expected: "🚀 Server running on port 5001"');
      console.error('');
      console.error('2. ✓ Test backend in browser:');
      console.error(`   Open: ${API_CONFIG.HEALTH_CHECK_URL}`);
      console.error('   Expected: {"status":"OK",...}');
      console.error('');
      console.error('3. ✓ Check your environment:');
      
      if (Platform.OS === 'android') {
        console.error('   • Android Emulator: Using 10.0.2.2 (correct)');
        console.error('   • Physical Android device: Need to update IP in config');
      } else if (Platform.OS === 'ios') {
        console.error('   • iOS Simulator: Using localhost (correct)');
        console.error('   • Physical iOS device: Need to update IP in config');
      }
      
      console.error('');
      console.error('4. ✓ Firewall check:');
      console.error('   • Ensure port 5001 is not blocked');
      console.error('   • Temporarily disable firewall to test');
      console.error('');
      console.error('5. ✓ Backend environment:');
      console.error('   • Check backend/.env has NODE_ENV=development');
      console.error('   • Check CORS is allowing your origin');
      console.error('═══════════════════════════════════════');
      
      // Create a user-friendly error
      const networkError = new Error(
        'Cannot connect to server. Please check your backend is running.'
      );
      networkError.isNetworkError = true;
      networkError.code = 'NETWORK_ERROR';
      networkError.originalError = error;
      
      return Promise.reject(networkError);
    }
    
    // ========================================
    // HTTP ERROR HANDLING
    // ========================================
    
    console.error('❌ API Error Response:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    // Handle 401 Unauthorized - clear auth data and redirect to login
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized (401) - Clearing auth data');
      
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        
        // You might want to navigate to login here
        // Example: navigation.navigate('Login');
      } catch (storageError) {
        console.error('❌ Error clearing auth data:', storageError);
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden (403) - Access denied');
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Not Found (404) - Endpoint does not exist');
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status >= 500) {
      console.error('💥 Server Error (500+) - Backend issue');
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// CONVENIENCE METHODS
// ========================================

/**
 * Check if an error is a network error
 */
export const isNetworkError = (error) => {
  return error?.isNetworkError === true || 
         error?.code === 'NETWORK_ERROR' ||
         !error?.response;
};

/**
 * Get a user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Cannot connect to server. Please check your connection.';
  }
  
  if (error.response?.status === 401) {
    return 'Session expired. Please login again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  // Try to get error message from response
  const serverMessage = error.response?.data?.error || 
                       error.response?.data?.message;
  
  if (serverMessage) {
    return serverMessage;
  }
  
  return error.message || 'An unexpected error occurred.';
};

// ========================================
// EXPORT
// ========================================

export default api;