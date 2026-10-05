// API Configuration and Utilities
const API_BASE_URL = window.location.origin + '/api';

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(data.message || `HTTP error! status: ${response.status}`);
            error.data = data; // Include full response data for access to errors array
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API Methods
const api = {
    // Auth
    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    
    getMe: () => apiRequest('/auth/me'),
    
    updateProfile: (data) => apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    changePassword: (data) => apiRequest('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // Permits
    getPermits: () => apiRequest('/permits'),
    
    getPermit: (id) => apiRequest(`/permits/${id}`),
    
    createPermit: (data) => apiRequest('/permits', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    uploadDocuments: (permitId, formData) => apiRequest(`/permits/${permitId}/documents`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type with boundary
    }),
    
    submitPermit: (permitId) => apiRequest(`/permits/${permitId}/submit`, {
        method: 'POST',
    }),
    
    // Admin
    getAdminStats: () => apiRequest('/admin/dashboard'),
    
    getPermitsAdmin: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/permits/admin/all?${query}`);
    },
    
    reviewDocument: (permitId, docId, data) => apiRequest(`/permits/${permitId}/documents/${docId}/review`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    getDocuments: (permitId) => apiRequest(`/permits/${permitId}/documents`),
    
    updateAssessment: (permitId, data) => apiRequest(`/permits/${permitId}/assessment`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    updatePermitStatus: (permitId, status, remarks) => apiRequest(`/admin/permits/${permitId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, remarks }),
    }),
    
    getAllUsers: () => apiRequest('/admin/users'),
    
    updateUserRole: (userId, role) => apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    }),
    
    deleteUser: (userId) => apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE',
    }),
    
    getChatLogs: () => apiRequest('/admin/chatlogs'),
    
    // Chatbot
    sendMessage: (message, sessionId) => apiRequest('/chatbot', {
        method: 'POST',
        body: JSON.stringify({ message, sessionId }),
    }),
    
    rateResponse: (logId, rating) => apiRequest('/chatbot/rate', {
        method: 'POST',
        body: JSON.stringify({ logId, rating }),
    }),
};
