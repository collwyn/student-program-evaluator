const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  settings: {
    theme: {
      primaryColor: String,
      logoUrl: String,
      customCss: String
    },
    customMetrics: [{
      name: String,
      description: String,
      formula: String,
      thresholds: {
        low: Number,
        medium: Number,
        high: Number
      }
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'trial'
    },
    validUntil: Date,
    paymentMethod: {
      type: String,
      select: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ subdomain: 1 });

module.exports = mongoose.model('Organization', organizationSchema);
