import axios from 'axios';
import { toast } from '../components/Toast';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/admin/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Admin Token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401/403 blocked/unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const isAuthError = status === 401 || status === 403;

    if (isAuthError && !window.location.pathname.includes('/login')) {
      const msg = data?.msg || (status === 403 ? 'Your administrator account has been deactivated.' : 'Session expired. Please log in again.');
      toast.error(msg, status === 403 ? 'Account Inactive' : 'Authentication Required');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    }
    return Promise.reject(error);
  }
);

export default api;

