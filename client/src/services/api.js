// src/services/api.js
import axios from 'axios';

// Set the base URL for API requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },
  
  // Get a specific student by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  },
  
  // Get student performance metrics
  getPerformance: async (id) => {
    try {
      const response = await api.get(`/students/${id}/performance`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${id} performance:`, error);
      throw error;
    }
  }
};

// Class API calls
export const classService = {
  // Get all classes
  getAll: async () => {
    try {
      const response = await api.get('/classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },
  
  // Get a specific class by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      throw error;
    }
  },
  
  // Get class effectiveness metrics
  getEffectiveness: async (id) => {
    try {
      const response = await api.get(`/classes/${id}/effectiveness`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching class ${id} effectiveness:`, error);
      throw error;
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