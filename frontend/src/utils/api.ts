import axios from 'axios';
// Create axios instance with base URL
export const api = axios.create({
  baseURL: 'https://api.digitalsignature.example',
  // Replace with your actual API URL
  headers: {
    'Content-Type': 'application/json'
  }
});
// Add request interceptor to add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));
// Add response interceptor to handle token refresh
api.interceptors.response.use(response => response, async error => {
  const originalRequest = error.config;
  // If error is 401 and not already retrying
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      const response = await axios.post('https://api.digitalsignature.example/auth/refresh', {
        refreshToken
      });
      const {
        token
      } = response.data;
      localStorage.setItem('token', token);
      // Update the authorization header
      originalRequest.headers.Authorization = `Bearer ${token}`;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});