import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

// Create axios instance for admin API with cookie-based auth
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Important for cookies
});

// Function to get CSRF token
async function getCsrfToken() {
  try {
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
}

// Request interceptor
adminApi.interceptors.request.use(
  async (config) => {
    // Get CSRF token before each request
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      await getCsrfToken();
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
  async (error) => {
    console.log('AdminApi interceptor caught error:', error);
    console.log('Error response:', error?.response);
    
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear any stored admin data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_data');
        
        // Redirect to admin login
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
      
      return Promise.reject(error);
    }

    // Handle CSRF token mismatch (419)
    if (error.response?.status === 419) {
      // Try to refresh CSRF token and retry
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        await getCsrfToken();
        return adminApi(originalRequest);
      }
      
      return Promise.reject({
        message: 'Session expired. Please refresh the page and try again.',
        type: 'csrf',
        response: error.response
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network',
        originalError: error
      });
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      return Promise.reject({
        message: error.response.data?.message || 'Too many requests. Please try again later.',
        type: 'rate_limit',
        response: error.response
      });
    }

    // Handle validation errors
    if (error.response?.status === 422) {
      return Promise.reject({
        message: error.response.data?.message || 'Validation failed',
        errors: error.response.data?.errors,
        type: 'validation',
        response: error.response
      });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject({
        message: error.response.data?.message || 'Server error. Please try again later.',
        type: 'server',
        response: error.response
      });
    }

    // Return the original error for other cases
    return Promise.reject(error);
  }
);

export default adminApi;
export { getCsrfToken };
