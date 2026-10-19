import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add public endpoints that don't need auth
export const publicApi = {
  getServices: (businessId) => api.get(`/services/public/${businessId}`),
  createBooking: (data) => api.post('/bookings/public', data),
};

export default api;