const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Common configuration across all environments
  common: {
    port: process.env.PORT || 3000,
    apiVersion: 'v1',
    uploadLimits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
      refreshExpiresIn: '7d'
    },
    bcrypt: {
      saltRounds: 10
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    subscription: {
      plans: {
        free: {
          price: 0,
          features: ['basic_analytics', 'student_management'],
          limits: {
            students: 50,
            programs: 2,
            storage: 100 // MB
          }
        },
        basic: {
          price: 29.99,
          features: ['basic_analytics', 'student_management', 'program_management', 'basic_reports'],
          limits: {
            students: 200,
            programs: 5,
            storage: 500 // MB
          }
        },
        professional: {
          price: 99.99,
          features: [
            'basic_analytics',
            'student_management',
            'program_management',
            'basic_reports',
            'advanced_analytics',
            'custom_reports',
            'api_access'
          ],
          limits: {
            students: 1000,
            programs: 20,
            storage: 2000 // MB
          }
        },
        enterprise: {
          price: 299.99,
          features: [
            'basic_analytics',
            'student_management',
            'program_management',
            'basic_reports',
            'advanced_analytics',
            'custom_reports',
            'api_access',
            'white_label'
          ],
          limits: {
            students: 5000,
            programs: 100,
            storage: 10000 // MB
          }
        }
      }
    },
    analytics: {
      performanceThresholds: {
        excellent: 3.5,
        good: 3.0,
        average: 2.0,
        needsImprovement: 0
      },
      attendanceThresholds: {
        excellent: 95,
        good: 90,
        average: 85,
        poor: 80
      },
      programEffectivenessWeights: {
        studentPerformance: 0.4,
        attendance: 0.2,
        satisfaction: 0.2,
        completionRate: 0.2
      }
    }
  },

  // Development environment specific configuration
  development: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/student-evaluation-dev',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
      }
    },
    logging: {
      level: 'debug',
      format: 'dev'
    },
    email: {
      from: 'dev@student-evaluation.com',
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    }
  },

  // Production environment specific configuration
  production: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
        poolSize: 10
      }
    },
    logging: {
      level: 'info',
      format: 'combined'
    },
    email: {
      from: process.env.EMAIL_FROM,
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    }
  },

  // Test environment specific configuration
  test: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/student-evaluation-test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
      }
    },
    logging: {
      level: 'error',
      format: 'dev'
    },
    email: {
      from: 'test@student-evaluation.com',
      transport: 'nodemailer-mock'
    }
  }
};

// Determine current environment
const env = process.env.NODE_ENV || 'development';

// Export merged configuration
module.exports = {
  ...config.common,
  ...config[env],
  env
};
