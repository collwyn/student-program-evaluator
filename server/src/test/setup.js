const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

let mongoServer;

// Setup function to run before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Test helper functions
const testHelpers = {
  // Create test token
  generateTestToken: (userData) => {
    return jwt.sign(userData, config.jwt.secret, { expiresIn: '1h' });
  },

  // Create test organization
  createTestOrganization: async () => {
    const Organization = mongoose.model('Organization');
    return await Organization.create({
      name: 'Test Organization',
      subdomain: 'test-org-' + Date.now(),
      settings: {
        theme: {
          primaryColor: '#000000',
          logoUrl: 'https://example.com/logo.png'
        }
      },
      subscription: {
        plan: 'basic',
        status: 'active'
      }
    });
  },

  // Create test user
  createTestUser: async (organizationId, role = 'admin') => {
    const User = mongoose.model('User');
    return await User.create({
      organizationId,
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      role,
      status: 'active'
    });
  },

  // Create test program
  createTestProgram: async (organizationId) => {
    const Program = mongoose.model('Program');
    return await Program.create({
      organizationId,
      name: 'Test Program',
      description: 'Test program description',
      type: 'academic',
      metrics: {
        effectivenessScore: 85,
        studentSatisfaction: 4.5,
        averagePerformance: 88,
        completionRate: 92
      },
      status: 'active'
    });
  },

  // Create test student
  createTestStudent: async (organizationId, programIds = []) => {
    const Student = mongoose.model('Student');
    return await Student.create({
      organizationId,
      programIds,
      personalInfo: {
        firstName: 'Test',
        lastName: 'Student',
        email: `student-${Date.now()}@example.com`,
        studentId: `STU${Date.now()}`
      },
      academicProfile: {
        grade: '10',
        status: 'active',
        performanceMetrics: {
          overallGPA: 3.5,
          attendanceRate: 95,
          participationScore: 88
        }
      }
    });
  },

  // Create test assessment
  createTestAssessment: async (studentId, programId) => {
    const Student = mongoose.model('Student');
    const assessment = {
      programId,
      type: 'exam',
      name: 'Test Assessment',
      score: 85,
      maxScore: 100,
      date: new Date(),
      feedback: 'Good performance'
    };

    await Student.findByIdAndUpdate(studentId, {
      $push: { assessments: assessment }
    });
    return assessment;
  },

  // Generate test attendance records
  createTestAttendance: async (studentId, programId, count = 10) => {
    const Student = mongoose.model('Student');
    const attendance = Array.from({ length: count }, (_, i) => ({
      programId,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      status: i % 5 === 0 ? 'absent' : 'present'
    }));

    await Student.findByIdAndUpdate(studentId, {
      $push: { attendance: { $each: attendance } }
    });
    return attendance;
  },

  // Mock Stripe customer/subscription
  createTestSubscription: async (organizationId) => {
    const Organization = mongoose.model('Organization');
    await Organization.findByIdAndUpdate(organizationId, {
      subscription: {
        plan: 'professional',
        status: 'active',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }
};

global.testHelpers = testHelpers;
