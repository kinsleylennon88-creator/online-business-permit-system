import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data)
    }
    
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login if not already there
          localStorage.removeItem('token')
          if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          console.warn('Access forbidden:', data.message)
          break
          
        case 404:
          console.warn('Resource not found:', data.message)
          break
          
        case 429:
          console.warn('Rate limited:', data.message)
          break
          
        case 500:
          console.error('Server error:', data.message)
          break
          
        default:
          console.error('API error:', data.message || 'Unknown error')
      }
    } else if (error.request) {
      console.error('Network error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Authentication Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
}

// Permit Services
export const permitService = {
  getPermits: (params = {}) => api.get('/permits', { params }),
  getRequirements: (params = {}) => api.get('/permits/requirements', { params }),
  getPermit: (id) => api.get(`/permits/${id}`),
  createPermit: (permitData) => api.post('/permits', permitData),
  uploadDocuments: (id, formData) => api.put(`/permits/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submitPermit: (id) => api.put(`/permits/${id}/submit`),
  approvePermit: (id, data) => api.put(`/permits/${id}/approve`, data),
  rejectPermit: (id, data) => api.put(`/permits/${id}/reject`, data),
  updateAssessment: (id, data) => api.put(`/permits/${id}/assessment`, data),
  deletePermit: (id) => api.delete(`/permits/${id}`),
}

// Administration Services
export const adminService = {
  getMetrics: () => api.get('/admin/metrics'),
  getPermits: (params = {}) => api.get('/admin/permits', { params }),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getDocumentRequirements: () => api.get('/admin/document-requirements'),
  createDocumentRequirement: (data) => api.post('/admin/document-requirements', data),
  updateDocumentRequirement: (id, data) => api.put(`/admin/document-requirements/${id}`, data),
  deleteDocumentRequirement: (id) => api.delete(`/admin/document-requirements/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getChatLogs: (params = {}) => api.get('/admin/chatlogs', { params }),
  resolveChatLog: (id, resolution) => api.put(`/admin/chatlogs/${id}/resolve`, { resolution }),
  getSystemHealth: () => api.get('/admin/system-health'),
}

// Bureau of Fire and Sanitation Agency Services
export const agencyService = {
  getQueue: (params = {}) => api.get('/agency/queue', { params }),
  getPermit: (id, params = {}) => api.get(`/agency/permits/${id}`, { params }),
  submitReview: (id, data) => api.put(`/agency/permits/${id}/review`, data),
  uploadDocument: (id, formData) => api.post(`/agency/permits/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// In-App Notification Services
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
}

// Chatbot Services
export const chatbotService = {
  sendMessage: (data) => api.post('/chatbot', data, { timeout: 120000 }),
  rateResponse: (data) => api.post('/chatbot/rate', data),
  getFAQ: () => api.get('/chatbot/faq'),
}

// Health check
export const healthCheck = () => api.get('/health')

export default api
