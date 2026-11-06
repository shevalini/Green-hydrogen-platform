import axios from 'axios';

// Default to '' so requests are same-origin (routed through Vite proxy or production proxy),
// eliminating cross-site cookie restrictions between 127.0.0.1 and localhost.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true, // send HttpOnly JWT cookie automatically
});

// Attach Authorization Bearer token header if present in localStorage as a backup
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
