import axios from 'axios';
import TokenManager from './tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // We're using Bearer tokens, not cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      TokenManager.clearToken();
      
      // Redirect to login if we're not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle CSRF token mismatch (419)
    if (error.response?.status === 419) {
      return Promise.reject({
        message: 'Session expired. Please refresh the page and try again.',
        type: 'csrf'
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network'
      });
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      return Promise.reject({
        message: error.response.data?.message || 'Too many requests. Please try again later.',
        type: 'rate_limit'
      });
    }

    // Handle validation errors
    if (error.response?.status === 422) {
      return Promise.reject({
        message: 'Validation failed',
        errors: error.response.data?.errors,
        type: 'validation'
      });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        type: 'server'
      });
    }

    return Promise.reject(error);
  }
);

export default api;