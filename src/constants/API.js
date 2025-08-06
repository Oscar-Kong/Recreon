export const API_BASE_URL = __DEV__ 
  ? 'http://172.20.10.4:5001/api'  // Fixed to match your backend
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__ 
  ? 'http://172.20.10.4:5001' 
  : 'https://your-production-api.com';

export const API_TIMEOUT = 10000;