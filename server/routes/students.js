// routes/students.js
const express = require('express');
const router = express.Router();
const Student = require('../models/student');
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

// In the GET / route in routes/students.js
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('classes', 'name');
    console.log(`Returning ${students.length} students`);
    if (students.length > 0) {
      console.log('Sample student data:', students[0]);
    }
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;