import axios from 'axios';

// Use the environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://appointment-scheduler-backend-duvy.onrender.com/api';

// Cache for storing API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add debug logging only in development
if (import.meta.env.DEV) {
  console.log('API_URL:', API_URL);
  console.log('Environment:', import.meta.env.MODE);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Cache interceptor
api.interceptors.request.use((config) => {
  // Only cache GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}${JSON.stringify(config.params)}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return Promise.reject({
        cached: true,
        data: cached.data,
        config
      });
    }
  }
  
  return config;
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  if (import.meta.env.DEV) {
    console.error('Request error:', error);
  }
  return Promise.reject(error);
});

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params)}`;
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve(error);
    }

    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Optimized auth service with memoization
const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    responseCache.clear(); // Clear cache on logout
  }
};

// Optimized appointment service with caching
const appointmentService = {
  getAll: () => api.get('/appointments'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => {
    responseCache.clear(); // Clear cache on create
    return api.post('/appointments', data);
  },
  update: (id: string, data: any) => {
    responseCache.clear(); // Clear cache on update
    return api.put(`/appointments/${id}`, data);
  },
  delete: (id: string) => {
    responseCache.clear(); // Clear cache on delete
    return api.delete(`/appointments/${id}`);
  },
};

export { authService, appointmentService };
export default api; 