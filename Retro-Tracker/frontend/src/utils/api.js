import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure token is properly formatted
      const cleanToken = token.trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
      console.warn('No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track last successful API call to detect if user is actively using the app
// Initialize to current time so we don't redirect immediately after login
let lastSuccessfulCall = Date.now();

// Update last successful call on successful responses
api.interceptors.response.use(
  (response) => {
    lastSuccessfulCall = Date.now();
    return response;
  },
  (error) => {
    // Don't redirect if user just logged in (within 5 seconds)
    const justLoggedIn = localStorage.getItem('justLoggedIn');
    if (justLoggedIn) {
      console.log('API error ignored - user just logged in');
      return Promise.reject(error);
    }
    
    // Only redirect on 401 if we're not already on login/register page
    // AND if the error is not from auth endpoints (login/register/profile)
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register') ||
                          error.config?.url?.includes('/auth/profile');
    
    // Check if we have a token - if not, don't redirect (user might not be logged in)
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.reject(error);
    }
    
    // Only redirect on 401 if it's a clear token expiration/invalid error
    // Otherwise, let components handle the error
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register') &&
        !isAuthEndpoint) {
      
      const errorMessage = (error.response?.data?.message || '').toLowerCase();
      
      // Only redirect on very specific token errors
      const isClearTokenError = errorMessage.includes('token expired') || 
                               errorMessage.includes('invalid token') ||
                               errorMessage === 'authentication required';
      
      // Don't redirect if user just had a successful call (within last minute)
      // This prevents redirects during active sessions
      const timeSinceLastSuccess = Date.now() - lastSuccessfulCall;
      const isActiveSession = timeSinceLastSuccess < 60000; // 1 minute
      
      if (isClearTokenError && !isActiveSession) {
        // Only redirect if it's a clear token error AND user hasn't been active recently
        console.error('Token expired or invalid - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedTeamId');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else {
        // For other 401 errors or during active sessions, just log
        // Let the component handle the error gracefully
        console.warn('401 error - not redirecting (active session or unclear error):', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

