import axios from 'axios';
import toast from 'react-hot-toast';

// Helper function to parse error messages from backend
function parseErrorMessage(error: any): string {
  // No response - network error
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  // Handle specific status codes
  if (status === 403) return 'You don\'t have permission for this action.';
  if (status === 404) return 'Resource not found.';
  if (status === 500) return 'Server error. Please try again later.';
  if (status === 503) return 'Service temporarily unavailable.';

  // Parse FastAPI error format
  if (data?.detail) {
    // String detail
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    // Array of validation errors
    if (Array.isArray(data.detail)) {
      const firstError = data.detail[0];
      return firstError?.msg || firstError?.message || 'Validation error';
    }
    // Object detail
    if (typeof data.detail === 'object') {
      return data.detail.message || data.detail.msg || 'An error occurred';
    }
  }

  return 'Something went wrong. Please try again.';
}

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',  // Nginx will proxy /api → backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Send cookies with every request
});

// Interceptor: Automatically add token to every request
api.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // If token exists, add it to Authorization header
  // (Response interceptor will handle refresh if it's expired)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor: Handle errors globally and auto-refresh tokens
api.interceptors.response.use(
  (response) => response,  // If successful, just return response
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // Mark as retried to prevent infinite loop
      
      console.log('🔄 Access token expired, refreshing...');
      
      try {
        // Call refresh endpoint via relative path so requests go through nginx (/api → backend).
        // Avoid using build-time NEXT_PUBLIC_API_URL here to prevent embedded IPs in the bundle.
        const { data } = await axios.post(
          `/api/auth/refresh`,
          {},
          {
            withCredentials: true  // CRITICAL: Send cookies with request
          }
        );
        
        console.log('✅ Refresh successful, got new access token');
        
        // Save new access token
        localStorage.setItem('token', data.access_token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.log('❌ Refresh failed, logging out');
        // Refresh failed - only clear token, don't redirect
        // Let ProtectedRoute handle the redirect based on UserContext state
        localStorage.removeItem('token');
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, show toast notification
    // Skip toast for 401 (already handled above) and silent requests
    if (error.response?.status !== 401 && !originalRequest.silent) {
      const errorMessage = parseErrorMessage(error);
      toast.error(errorMessage);
    }
    
    // For other errors or if retry already happened, just reject
    return Promise.reject(error);
  }
);

export default api;
