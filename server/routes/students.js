// routes/students.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Class = require('../models/Class');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('classes', 'name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('classes');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student performance metrics
router.get('/:id/performance', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Calculate additional metrics here if needed
    
    res.json({
      name: student.name,
      averageYearGrade: student.averageYearGrade,
      performanceIndicator: student.performanceIndicator
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;