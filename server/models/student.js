// models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  monthlyGrades: {
    type: Map,
    of: Map, // Nested map structure: { classId: { month: grade } }
    default: {}
  },
  attendance: {
    type: Map,
    of: Map, // Nested map: { classId: { month: attendancePercentage } }
    default: {}
  },
  essay: {
    type: String,
    default: ''
  },
  averageYearGrade: {
    type: Number,
    default: 0
  },
  performanceIndicator: {
    type: String,
    enum: ['Improved', 'Neutral', 'Struggled'],
    default: 'Neutral'
  }
});

module.exports = mongoose.model('Student', StudentSchema);

