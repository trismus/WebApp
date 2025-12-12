import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Settings endpoints
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  getSystemSettings: () => api.get('/settings/system'),
};

// Activity endpoints
export const activityAPI = {
  getMyActivity: (params) => api.get('/activity/me', { params }),
  getAllActivity: (params) => api.get('/activity/all', { params }),
  getActivityStats: () => api.get('/activity/stats'),
};

// Analytics endpoints
export const analyticsAPI = {
  getMyAnalytics: () => api.get('/analytics/me'),
  getOperatorAnalytics: () => api.get('/analytics/operator'),
  getSystemAnalytics: () => api.get('/analytics/system'),
  refreshAnalytics: () => api.post('/analytics/refresh'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
