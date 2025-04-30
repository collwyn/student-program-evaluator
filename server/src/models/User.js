const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  profile: {
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
    title: String,
    phone: String,
    avatar: String
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'teacher', 'staff', 'readonly'],
    required: true
  },
  permissions: {
    programs: {
      view: { type: Boolean, default: true },
      create: Boolean,
      edit: Boolean,
      delete: Boolean
    },
    students: {
      view: { type: Boolean, default: true },
      create: Boolean,
      edit: Boolean,
      delete: Boolean
    },
    analytics: {
      view: { type: Boolean, default: true },
      export: Boolean
    },
    users: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean
    },
    settings: {
      view: Boolean,
      edit: Boolean
    }
  },
  preferences: {
    notifications: {
      email: {
        performance: { type: Boolean, default: true },
        reports: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      },
      inApp: {
        performance: { type: Boolean, default: true },
        reports: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'programs', 'students', 'analytics'],
        default: 'overview'
      },
      favoriteReports: [String]
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ organizationId: 1, email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
