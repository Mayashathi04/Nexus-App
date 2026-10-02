import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear auth credentials if not on login/register
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthRoute && localStorage.getItem('nexus_token')) {
        console.warn('Session expired or unauthorized. Logging out.');
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API Service Helper Methods
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: (idOrUsername: string) => api.get(`/users/${idOrUsername}`),
  updateProfile: (id: string, data: any) => api.put(`/users/${id}`, data),
  search: (query: string) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  follow: (id: string) => api.post(`/users/${id}/follow`),
  unfollow: (id: string) => api.delete(`/users/${id}/follow`),
  getFollowers: (id: string) => api.get(`/users/${id}/followers`),
  getFollowing: (id: string) => api.get(`/users/${id}/following`),
};

export const postAPI = {
  getFeed: (page = 1) => api.get('/posts?feed=true'),
  getExplore: (hashtag?: string, search?: string) => {
    let url = '/posts';
    const params = new URLSearchParams();
    if (hashtag) params.append('hashtag', hashtag);
    if (search) params.append('q', search);
    const queryString = params.toString();
    return api.get(queryString ? `${url}?${queryString}` : url);
  },
  getUserPosts: (userId: string) => api.get(`/posts?author=${userId}`),
  getPost: (id: string) => api.get(`/posts/${id}`),
  create: (data: { caption: string; image?: string; hashtags?: string[] }) => api.post('/posts', data),
  update: (id: string, data: { caption?: string; image?: string; hashtags?: string[] }) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  like: (id: string) => api.post(`/posts/${id}/like`),
  unlike: (id: string) => api.delete(`/posts/${id}/like`),
};

export const commentAPI = {
  getByPost: (postId: string) => api.get(`/posts/${postId}/comments`),
  add: (postId: string, content: string) => api.post(`/posts/${postId}/comments`, { content }),
  delete: (commentId: string) => api.delete(`/comments/${commentId}`),
};

export const chatAPI = {
  getConversations: () => api.get('/conversations'),
  startConversation: (recipientId: string) => api.post('/conversations', { recipientId }),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId: string, content: string, receiverId?: string) =>
    api.post('/messages', { conversationId, content, receiverId }),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const systemAPI = {
  getHealth: () => api.get('/docs/health'),
  getPostmanCollection: () => api.get('/docs/postman'),
};
