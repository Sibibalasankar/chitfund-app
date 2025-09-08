import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // 🔹 Change to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ✅ On mobile, replace with SecureStore
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // ✅ On mobile, use navigation reset
    }
    return Promise.reject(error);
  }
);

// ---------------------- AUTH ----------------------
export const authAPI = {
  // 🔹 Participant Login
  login: (phone, password) => api.post('/auth/login', { phone, password }),

  // 🔹 Admin Login
  adminLogin: (phone, password) => api.post('/auth/admin-login', { phone, password }),

  // 🔹 Register Participant
  register: (userData) => api.post('/auth/register', userData),

  // 🔹 Forgot / Reset Password
  forgotPassword: (phone) => api.post('/auth/forgot-password', { phone }),
  resetPassword: (phone, otp, newPassword) =>
    api.post('/auth/reset-password', { phone, otp, newPassword }),
};

// ---------------------- USERS ----------------------
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// ---------------------- FUNDS ----------------------
export const fundAPI = {
  getAll: () => api.get('/funds'),
  getByUserId: (userId) => api.get(`/funds/user/${userId}`),
  create: (fundData) => api.post('/funds', fundData),
  update: (id, fundData) => api.put(`/funds/${id}`, fundData),
  delete: (id) => api.delete(`/funds/${id}`),
  makePayment: (id, paymentData) => api.post(`/funds/${id}/payment`, paymentData),
};

// ---------------------- NOTIFICATIONS ----------------------
export const notificationAPI = {
  getByUserId: (userId) => api.get(`/notifications/user/${userId}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
};

export default api;
