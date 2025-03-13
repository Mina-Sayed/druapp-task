import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3002/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials in cross-origin requests
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('user');
      if (userString && userString !== 'undefined' && userString !== 'null') {
        try {
          const userData = JSON.parse(userString);
          if (userData && userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
          } else if (!userData || !userData.token) {
            // If token is missing but user data exists, it's invalid
            console.warn('Invalid user data in localStorage: missing token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          // Clean up corrupted data
          localStorage.removeItem('user');
        }
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data);
      
      // If we're in a browser environment, check if we should clear user data
      if (typeof window !== 'undefined') {
        // Don't clear on login/register endpoints
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                              error.config?.url?.includes('/auth/register');
        
        if (!isAuthEndpoint) {
          // Clear user data for auth errors on protected endpoints
          localStorage.removeItem('user');
          // Redirect to login page if needed
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }
    } else if (!error.response) {
      // Network error or server not available
      console.error('Network error or server not available');
    } else {
      console.error('Response error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      console.log('Login payload:', { email, password });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', error.response?.data);
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (name: string, email: string, password: string, role: 'patient' | 'doctor') => {
    try {
      console.log('Registration payload:', { name, email, password, role });
      const response = await api.post('/auth/register', { name, email, password, role });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error details:', error.response?.data);
      console.error('Registration error:', error);
      throw error;
    }
  },
};

// User Profile API
export const profileApi = {
  getProfile: async () => {
    try {
      console.log('Making GET request to:', `${api.defaults.baseURL}/users/profile`);
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // For development purposes only - provide mock data when endpoint is unavailable
      if (process.env.NODE_ENV === 'development' && error?.response?.status === 404) {
        console.warn('Using mock profile data in development mode due to endpoint 404');
        return {
          id: 'mock-user-id',
          name: 'Development User',
          email: 'dev@example.com',
          role: 'PATIENT',
          bio: 'This is mock data shown because the profile endpoint returned 404',
          createdAt: new Date().toISOString(),
          // Add other fields as needed
        };
      }
      
      throw error;
    }
  },
  
  updateProfile: async (updateData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
    licenseNumber?: string;
    phone?: string;
    address?: string;
    bio?: string;
  }) => {
    try {
      const response = await api.put('/users/profile', updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/users/profile/password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

// Medical Records API
export const medicalRecordsApi = {
  getAll: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/medical-records', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },
  getRecord: async (id: string) => {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching record details:', error);
      throw error;
    }
  },
  uploadRecord: async (formData: FormData) => {
    try {
      const response = await api.post('/medical-records/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading medical record:', error);
      throw error;
    }
  },
  updateRecord: async (id: string, formData: FormData) => {
    try {
      const response = await api.patch(`/medical-records/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  },
  getRecordVersions: async (id: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/medical-records/${id}/versions`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching record versions:', error);
      throw error;
    }
  },
  getVersionContent: async (recordId: string, versionId: string) => {
    try {
      const response = await api.get(
        `/medical-records/${recordId}/versions/${versionId}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching version content:', error);
      throw error;
    }
  },
  deleteRecord: async (id: string) => {
    try {
      const response = await api.delete(`/medical-records/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  },
  downloadRecord: async (id: string) => {
    try {
      const response = await api.get(`/medical-records/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading medical record:', error);
      throw error;
    }
  },
};

// Messages API
export const messagesApi = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getConversation: async (userId: string) => {
    try {
      const response = await api.get(`/messages/conversations/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await api.post('/messages', { receiverId, content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
};

export default api; 