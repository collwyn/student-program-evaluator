// src/services/api.js
import axios from 'axios';

// Set the base URL for API requests
const BACKEND_URL = 'https://student-program-evaluator-backend.onrender.com';
const API_URL = process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'localhost' 
                 ? 'http://localhost:5000/api' 
                 : `${BACKEND_URL}/api`);

// Log the baseURL for debugging
console.log('API baseURL:', API_URL);
console.log('Host environment:', window.location.hostname);

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Set a reasonable timeout
});

// Add interceptors for debugging
api.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url} successful`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`Error ${error.response.status} from ${error.config.url}:`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.message);
    }
    return Promise.reject(error);
  }
);

// Student API calls
export const studentService = {
  // Get all students
  getAll: async () => {
    try {
      console.log('Fetching all students...');
      const response = await api.get('/students');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { data: [], error: error.message };
    }
  },
  
  // Get a specific student by ID
  getById: async (id) => {
    try {
      console.log(`Fetching student with ID: ${id}`);
      const response = await api.get(`/students/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      // Try a direct API call as a fallback
      try {
        console.log(`Trying direct backend URL for student ${id}...`);
        const directResponse = await axios.get(`${BACKEND_URL}/api/students/${id}`);
        return { data: directResponse.data };
      } catch (fallbackError) {
        console.error('Even direct API call failed:', fallbackError);
        return { data: null, error: error.message };
      }
    }
  }
};

// Class API calls
export const classService = {
  // Get all classes
  getAll: async () => {
    try {
      console.log('Fetching all classes...');
      const response = await api.get('/classes');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching classes:', error);
      return { data: [], error: error.message };
    }
  },
  
  // Get a specific class by ID
  getById: async (id) => {
    try {
      console.log(`Fetching class with ID: ${id}`);
      const response = await api.get(`/classes/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      // Try a direct API call as a fallback
      try {
        console.log(`Trying direct backend URL for class ${id}...`);
        const directResponse = await axios.get(`${BACKEND_URL}/api/classes/${id}`);
        return { data: directResponse.data };
      } catch (fallbackError) {
        console.error('Even direct API call failed:', fallbackError);
        return { data: null, error: error.message };
      }
    }
  }
};

// Data generation API call
export const dataService = {
  // Generate mock data
  generate: async () => {
    try {
      console.log('Generating mock data...');
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