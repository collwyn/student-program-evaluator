const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Program Controller', () => {
  let testOrg;
  let testUser;
  let testProgram;
  let authToken;

  beforeAll(async () => {
    // Create test organization and user
    testOrg = await testHelpers.createTestOrganization();
    testUser = await testHelpers.createTestUser(testOrg._id);
    authToken = testHelpers.generateTestToken({
      userId: testUser._id,
      organizationId: testOrg._id
    });
  });

  beforeEach(async () => {
    // Create fresh test program for each test
    testProgram = await testHelpers.createTestProgram(testOrg._id);
  });

  describe('GET /api/v1/programs', () => {
    it('should return list of programs for organization', async () => {
      const response = await request(app)
        .get('/api/v1/programs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]._id).toBe(testProgram._id.toString());
    });

    it('should filter programs by effectiveness score', async () => {
      // Create program with different effectiveness score
      await testHelpers.createTestProgram(testOrg._id, {
        metrics: { effectivenessScore: 60 }
      });

      const response = await request(app)
        .get('/api/v1/programs?effectiveness=80')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].metrics.effectivenessScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe('GET /api/v1/programs/:id', () => {
    it('should return program details', async () => {
      const response = await request(app)
        .get(`/api/v1/programs/${testProgram._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testProgram._id.toString());
      expect(response.body.data.name).toBe(testProgram.name);
    });

    it('should return 404 for non-existent program', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/programs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/programs', () => {
    it('should create new program', async () => {
      const newProgram = {
        name: 'New Test Program',
        description: 'New program description',
        type: 'academic'
      };

      const response = await request(app)
        .post('/api/v1/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProgram);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProgram.name);
      expect(response.body.data.organizationId).toBe(testOrg._id.toString());
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/programs/:id/effectiveness', () => {
    it('should return program effectiveness metrics', async () => {
      // Create test students and assessments
      const student = await testHelpers.createTestStudent(testOrg._id, [testProgram._id]);
      await testHelpers.createTestAssessment(student._id, testProgram._id);
      await testHelpers.createTestAttendance(student._id, testProgram._id);

      const response = await request(app)
        .get(`/api/v1/programs/${testProgram._id}/effectiveness`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('effectivenessScore');
      expect(response.body.data).toHaveProperty('studentCount');
      expect(response.body.data).toHaveProperty('completionRate');
      expect(response.body.data).toHaveProperty('averageGPA');
      expect(response.body.data).toHaveProperty('attendanceRate');
    });
  });

  describe('GET /api/v1/programs/:id/report', () => {
    it('should generate program performance report', async () => {
      // Create test data
      const student = await testHelpers.createTestStudent(testOrg._id, [testProgram._id]);
      await testHelpers.createTestAssessment(student._id, testProgram._id);
      await testHelpers.createTestAttendance(student._id, testProgram._id);

      const response = await request(app)
        .get(`/api/v1/programs/${testProgram._id}/report`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('timeSeriesData');
      expect(response.body.data).toHaveProperty('benchmarks');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  describe('GET /api/v1/programs/:programId/students/:studentId/performance', () => {
    it('should return student performance in program', async () => {
      const student = await testHelpers.createTestStudent(testOrg._id, [testProgram._id]);
      await testHelpers.createTestAssessment(student._id, testProgram._id);
      await testHelpers.createTestAttendance(student._id, testProgram._id);

      const response = await request(app)
        .get(`/api/v1/programs/${testProgram._id}/students/${student._id}/performance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('assessments');
      expect(response.body.data).toHaveProperty('attendance');
      expect(response.body.data).toHaveProperty('metrics');
    });

    it('should return 404 for invalid student/program combination', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/programs/${testProgram._id}/students/${fakeId}/performance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
