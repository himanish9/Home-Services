import axios from 'axios';

// Create dedicated Axios instance configured with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach Bearer token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homeserve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralize handling of 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token has expired or is invalid, clear storage
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('homeserve_token');
        localStorage.removeItem('homeserve_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
