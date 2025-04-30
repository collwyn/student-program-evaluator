// Test environment configuration
process.env.NODE_ENV = 'test';

// Server configuration
process.env.PORT = '5000';
process.env.API_VERSION = 'v1';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// JWT configuration
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// MongoDB configuration
process.env.MONGODB_URI = 'mongodb://localhost:27017/student-evaluation-test';

// Stripe configuration (test keys)
process.env.STRIPE_PUBLIC_KEY = 'pk_test_dummy_key';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy_key';

// Email configuration (test settings)
process.env.SMTP_HOST = 'smtp.mailtrap.io';
process.env.SMTP_PORT = '2525';
process.env.SMTP_USER = 'test_user';
process.env.SMTP_PASS = 'test_pass';
process.env.EMAIL_FROM = 'test@example.com';

// Rate limiting
process.env.RATE_LIMIT_WINDOW = '900000'; // 15 minutes in milliseconds
process.env.RATE_LIMIT_MAX = '100';

// File upload limits
process.env.MAX_FILE_SIZE = '10485760'; // 10MB in bytes
process.env.MAX_FILES = '5';

// Client URL
process.env.CLIENT_URL = 'http://localhost:3000';

// Analytics configuration
process.env.ANALYTICS_ENABLED = 'true';
process.env.ANALYTICS_SAMPLE_RATE = '100';

// Cache configuration
process.env.CACHE_TTL = '300'; // 5 minutes in seconds

// Logging configuration
process.env.LOG_LEVEL = 'error';
process.env.LOG_FORMAT = 'dev';

// Feature flags
process.env.ENABLE_AI_RECOMMENDATIONS = 'true';
process.env.ENABLE_ADVANCED_ANALYTICS = 'true';

// Test specific configurations
process.env.TEST_TIMEOUT = '5000';
process.env.MOCK_EXTERNAL_SERVICES = 'true';

// Organization defaults
process.env.DEFAULT_ORG_PLAN = 'basic';
process.env.DEFAULT_STORAGE_LIMIT = '100'; // 100MB

// Security settings
process.env.BCRYPT_ROUNDS = '1'; // Use minimal rounds for faster tests
process.env.ENABLE_2FA = 'false';

// Error reporting
process.env.SENTRY_DSN = '';
process.env.ENABLE_ERROR_REPORTING = 'false';

// Performance monitoring
process.env.ENABLE_PERFORMANCE_MONITORING = 'false';
process.env.PERFORMANCE_SAMPLE_RATE = '0';

// Test database cleanup
process.env.CLEANUP_TEST_DB = 'true';
process.env.CLEANUP_TIMEOUT = '5000';

// API documentation
process.env.SWAGGER_ENABLED = 'true';
process.env.API_DOCS_PATH = '/api-docs';

// Background jobs configuration
process.env.ENABLE_BACKGROUND_JOBS = 'false';
process.env.JOB_CONCURRENCY = '1';

// Webhook configuration
process.env.WEBHOOK_TIMEOUT = '5000';
process.env.WEBHOOK_RETRY_ATTEMPTS = '0';

// Test report configuration
process.env.JUNIT_REPORT_PATH = './test-results/junit/';
process.env.COVERAGE_REPORT_PATH = './coverage/';

module.exports = {
  // Export configured environment for reference in tests
  testConfig: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    },
    mongodb: {
      uri: process.env.MONGODB_URI
    },
    stripe: {
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    email: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM
    }
  }
};
