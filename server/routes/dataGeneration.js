// routes/dataGeneration.js
const express = require('express');
const router = express.Router(); // This line needs to be first
const Student = require('../models/Student');
const Class = require('../models/Class');
const { generateMockData } = require('../utils/dataGenerator');

// Generate mock data
router.post('/', async (req, res) => {
  try {
    console.log('Received request to generate mock data');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Student.deleteMany({});
    await Class.deleteMany({});
    
    // Generate new mock data
    console.log('Generating new mock data...');
    const result = await generateMockData();
    console.log('Mock data generation completed:', result);
    
    res.json({ message: 'Mock data generated successfully', result });
  } catch (err) {
    console.error('Error generating mock data:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;