import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import TokenManager from './tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Request queue for retry logic
interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: InternalAxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(prom.config);
    }
  });
  
  failedQueue = [];
};

// Create axios instance for admin API with token-based auth
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for production
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Using Bearer tokens, not cookies
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token available for request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).then(() => {
          return adminApi(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Clear invalid token and admin data
      TokenManager.clearToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_data');
        localStorage.removeItem('user_role');
        
        // Redirect to admin login
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
      
      processQueue(error);
      isRefreshing = false;
      
      return Promise.reject({
        message: 'Session expired. Please login again.',
        type: 'unauthorized',
        originalError: error
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        type: 'network',
        originalError: error
      });
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      return Promise.reject({
        message: retryAfter 
          ? `Too many requests. Please try again in ${retryAfter} seconds.`
          : 'Too many requests. Please try again later.',
        type: 'rate_limit',
        retryAfter: retryAfter ? parseInt(retryAfter) : null,
        response: error.response
      });
    }

    // Handle validation errors
    if (error.response?.status === 422) {
      return Promise.reject({
        message: (error.response.data as any)?.message || 'Validation failed',
        errors: (error.response.data as any)?.errors,
        type: 'validation',
        response: error.response
      });
    }

    // Handle forbidden errors
    if (error.response?.status === 403) {
      return Promise.reject({
        message: (error.response.data as any)?.message || 'Access denied. Admin privileges required.',
        type: 'forbidden',
        response: error.response
      });
    }

    // Handle not found errors
    if (error.response?.status === 404) {
      return Promise.reject({
        message: (error.response.data as any)?.message || 'Resource not found.',
        type: 'not_found',
        response: error.response
      });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject({
        message: (error.response.data as any)?.message || 'Server error. Please try again later.',
        type: 'server',
        response: error.response
      });
    }

    // Return the original error for other cases
    return Promise.reject(error);
  }
);

export default adminApi;
