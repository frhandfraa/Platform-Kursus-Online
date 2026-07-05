import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: tambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: bersihkan BOM & handle error
api.interceptors.response.use(
  (response) => {
    // Jika response.data string, bersihkan dari BOM dan parse JSON
    if (typeof response.data === 'string') {
      const cleaned = response.data.replace(/^\uFEFF/, '').trim();
      try {
        response.data = JSON.parse(cleaned);
      } catch (e) {
        console.error('Invalid JSON:', cleaned);
        throw new Error('Invalid JSON response from server');
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;