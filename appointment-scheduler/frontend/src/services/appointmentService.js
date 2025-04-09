import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const appointmentService = {
  // Get all appointments
  getAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single appointment
  getAppointment: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update an appointment
  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
}; 