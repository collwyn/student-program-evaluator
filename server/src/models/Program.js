const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    trim: true
  },
  metrics: {
    effectivenessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    studentSatisfaction: {
      type: Number,
      min: 0,
      max: 5,
      default: null
    },
    averagePerformance: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },
  customMetrics: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    calculationMethod: String
  }],
  assessmentCriteria: [{
    name: String,
    weight: Number,
    description: String,
    minimumScore: Number
  }],
  schedule: {
    startDate: Date,
    endDate: Date,
    sessions: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: String,
      endTime: String,
      location: String
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  aiRecommendations: [{
    type: {
      type: String,
      enum: ['improvement', 'intervention', 'resource']
    },
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    generatedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
programSchema.index({ organizationId: 1, name: 1 });
programSchema.index({ 'metrics.effectivenessScore': 1 });
programSchema.index({ status: 1 });

// Virtual populate for students
programSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'programIds'
});

module.exports = mongoose.model('Program', programSchema);
