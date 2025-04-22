// src/services/api.js
import axios from 'axios';

// Set the base URL for API requests - handle both local development and production
const API_URL = process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'localhost' 
                 ? 'http://localhost:5000/api' 
                 : 'https://student-program-evaluator-backend.onrender.com/api');

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Student API calls
export const studentService = {
  // Get all students
  getAll: async () => {
    try {
      const response = await api.get('/students');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { data: [] };
    }
  },
  
  // Get a specific student by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      return { data: null };
    }
  },
  
  // Get student performance metrics
  getPerformance: async (id) => {
    try {
      const response = await api.get(`/students/${id}/performance`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching student ${id} performance:`, error);
      return { data: null };
    }
  }
};

// Class API calls
export const classService = {
  // Get all classes
  getAll: async () => {
    try {
      const response = await api.get('/classes');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching classes:', error);
      return { data: [] };
    }
  },
  
  // Get a specific class by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      return { data: null };
    }
  },
  
  // Get class effectiveness metrics
  getEffectiveness: async (id) => {
    try {
      const response = await api.get(`/classes/${id}/effectiveness`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching class ${id} effectiveness:`, error);
      return { data: null };
    }
  }
};

// Data generation API call
export const dataService = {
  // Generate mock data
  generate: async () => {
    try {
      const response = await api.post('/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating mock data:', error);
      throw error;
    }
  }
};

export default {
  studentService,
  classService,
  dataService
};