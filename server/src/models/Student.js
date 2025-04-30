const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  programIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  }],
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true
    },
    dateOfBirth: Date,
    profileImage: String
  },
  academicProfile: {
    enrollmentDate: Date,
    grade: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'withdrawn'],
      default: 'active'
    },
    performanceMetrics: {
      overallGPA: {
        type: Number,
        min: 0,
        max: 4
      },
      attendanceRate: {
        type: Number,
        min: 0,
        max: 100
      },
      participationScore: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  assessments: [{
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    type: {
      type: String,
      enum: ['exam', 'project', 'assignment', 'participation', 'other']
    },
    name: String,
    score: Number,
    maxScore: Number,
    date: Date,
    feedback: String,
    gradedBy: String
  }],
  attendance: [{
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    date: Date,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused']
    },
    notes: String
  }],
  feedback: [{
    type: {
      type: String,
      enum: ['academic', 'behavioral', 'general']
    },
    source: String,
    content: String,
    date: Date
  }],
  learningProfile: {
    strengths: [String],
    challenges: [String],
    learningStyle: String,
    accommodations: [String],
    interests: [String]
  },
  progressTracking: {
    goals: [{
      description: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'delayed']
      },
      progress: Number
    }],
    milestones: [{
      name: String,
      achievedDate: Date,
      description: String
    }]
  },
  aiInsights: [{
    type: String,
    recommendation: String,
    generatedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'implemented', 'dismissed']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentSchema.index({ organizationId: 1, 'personalInfo.studentId': 1 });
studentSchema.index({ programIds: 1 });
studentSchema.index({ 'academicProfile.performanceMetrics.overallGPA': 1 });
studentSchema.index({ 'academicProfile.status': 1 });

// Compound index for name search
studentSchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text'
});

module.exports = mongoose.model('Student', studentSchema);
