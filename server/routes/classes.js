// routes/classes.js
const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const Student = require('../models/student');

// In the GET / route
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find();
    console.log(`Returning ${classes.length} classes`);
    if (classes.length > 0) {
      console.log('Sample class data:', classes[0]);
    }
    res.json(classes);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a specific class
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate('students', 'name averageYearGrade');
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get class effectiveness metrics
router.get('/:id/effectiveness', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    
    res.json({
      name: classData.name,
      yearAverage: classData.yearAverage,
      effectiveness: classData.effectiveness,
      monthlyAverages: classData.monthlyAverages
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;