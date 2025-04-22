// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import route files
const studentsRoutes = require('./routes/students');
const classesRoutes = require('./routes/classes');
const dataGenerationRoutes = require('./routes/dataGeneration');

const app = express();

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://student-program-evaluator-frontend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route - improved message
app.get('/', (req, res) => {
  res.send('Student Program Evaluator API is running');
});

// Routes
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/generate', dataGenerationRoutes);

// Enhanced debug route
app.get('/api/status', (req, res) => {
  res.json({
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Keep the original debug route for backward compatibility
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working',
    env: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// Handle 404 - add this AFTER all other routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing