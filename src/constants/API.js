export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Fixed to match your backend
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://your-production-api.com';

export const API_TIMEOUT = 10000;