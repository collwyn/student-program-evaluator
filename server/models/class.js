// models/Class.js
const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  monthlyAverages: {
    type: Map,
    of: Number,
    default: {}
  },
  effectiveness: {
    type: String,
    enum: ['Effective', 'Neutral', 'Ineffective'],
    default: 'Neutral'
  },
  yearAverage: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Class', ClassSchema);