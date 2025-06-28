import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
     console.log('🔐 Attached token to request:', token);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),

  verifyOTP: (phone: string, otp: string, name?: string) =>
    api.post('/auth/verify-otp', { phone, otp, name }),

  getCurrentUser: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getContacts: () => api.get('/users/contacts'),
  addContact: (phone: string) => api.post('/users/contacts', { phone }),
  updateProfile: (data: any) => api.put('/users/profile', data),
  blockUser: (userId: string) => api.post('/users/block', { userId }),
  unblockUser: (userId: string) => api.post('/users/unblock', { userId }),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
};

// Conversations API
export const conversationsAPI = {
  getConversations: () => api.get('/conversations'),
  createConversation: (participantId: string) => 
    api.post('/conversations', { participantId }),
  updateWallpaper: (conversationId: string, wallpaper: string) =>
    api.put(`/conversations/${conversationId}/wallpaper`, { wallpaper }),
};

// Messages API
export const messagesAPI = {
  getMessages: (conversationId: string, page = 1) => 
    api.get(`/messages/${conversationId}?page=${page}`),
  sendMessage: (conversationId: string, content: string, type = 'text') =>
    api.post('/messages', { conversationId, content, type }),
  addReaction: (messageId: string, emoji: string) =>
    api.post(`/messages/${messageId}/react`, { emoji }),
  markAsRead: (conversationId: string) =>
    api.put(`/messages/${conversationId}/read`),
};

export default api;