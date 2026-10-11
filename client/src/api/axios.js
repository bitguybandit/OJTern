import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ojterm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically unwrap success data or normalize error payload
api.interceptors.response.use(
  (response) => {
    // If response follows { success: true, data: ... }, return that data
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.data && error.response.data.error) {
      return Promise.reject(error.response.data.error);
    }
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to communicate with OJTerm server.'
    });
  }
);

export default api;
