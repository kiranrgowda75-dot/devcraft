import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  // Since we are using Next.js rewrites, the base URL is just /api
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401s and 403s (e.g. redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ((error.response?.status === 401 || error.response?.status === 403) && typeof window !== 'undefined') {
      // If we get a 401 or 403, token might be expired or database reset
      Cookies.remove('token');
      Cookies.remove('username');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
