// src/config/api.js
import { Platform } from 'react-native';

// ⚠️ SIMPLE VERSION - NO FANCY LOGIC
const BASE_URL = 'http://localhost:5001/api';

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  SOCKET_URL: 'http://localhost:5001',
  TIMEOUT: 30000, // Increased timeout
  HEALTH_CHECK_URL: 'http://localhost:5001/health',
};

// Always log this
console.log('');
console.log('═══════════════════════════════════════');
console.log('📡 API CONFIG - SIMPLE VERSION');
console.log('API URL:', API_CONFIG.BASE_URL);
console.log('Platform:', Platform.OS);
console.log('═══════════════════════════════════════');
console.log('');