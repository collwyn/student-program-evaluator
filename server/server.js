// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
// server.js - Update your mongoose.connect call
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase from default 10000ms to 30000ms
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err.message));

// Import routes
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const dataGenerationRoutes = require('./routes/dataGeneration');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/generate', dataGenerationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));