const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupDatabase();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests, please try again later.'
      }
    });
    this.app.use('/api/', limiter);

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Custom middleware for request tracking
    this.app.use((req, res, next) => {
      req.requestId = require('crypto').randomBytes(16).toString('hex');
      req.startTime = Date.now();
      next();
    });
  }

  async setupDatabase() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('Connected to MongoDB');

      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      // Handle graceful shutdown
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        time: new Date().toISOString(),
        mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      });
    });

    // API routes
    this.app.use('/api/v1', apiRoutes);

    // Handle 404
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', {
        error,
        requestId: req.requestId,
        path: req.path,
        method: req.method
      });

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.errors
        });
      }

      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate Entry',
          details: error.keyValue
        });
      }

      // Default error response
      res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message,
        requestId: req.requestId
      });
    });
  }

  async gracefulShutdown() {
    try {
      console.log('Received shutdown signal. Closing connections...');
      
      // Close MongoDB connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      
      // Exit process
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();
