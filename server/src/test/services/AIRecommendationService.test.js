const AIRecommendationService = require('../../services/AIRecommendationService');
const mongoose = require('mongoose');

describe('AIRecommendationService', () => {
  let testOrg;
  let testProgram;
  let testStudent;

  beforeAll(async () => {
    testOrg = await testHelpers.createTestOrganization();
  });

  beforeEach(async () => {
    testProgram = await testHelpers.createTestProgram(testOrg._id);
    testStudent = await testHelpers.createTestStudent(testOrg._id, [testProgram._id]);
  });

  describe('generateStudentRecommendations', () => {
    it('should generate recommendations for student with low performance', async () => {
      // Create assessment data indicating poor performance
      await testHelpers.createTestAssessment(testStudent._id, testProgram._id, {
        score: 55,
        maxScore: 100
      });

      const recommendations = await AIRecommendationService.generateStudentRecommendations(
        testStudent._id,
        testProgram._id
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendation structure
      const recommendation = recommendations[0];
      expect(recommendation).toHaveProperty('type');
      expect(recommendation).toHaveProperty('priority');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('specificActions');

      // Verify intervention recommendations for low performance
      expect(recommendations.some(r => 
        r.type === 'intervention' && 
        r.priority === 'high'
      )).toBe(true);
    });

    it('should generate recommendations for attendance issues', async () => {
      // Create attendance data with multiple absences
      await testHelpers.createTestAttendance(testStudent._id, testProgram._id, {
        status: 'absent',
        consecutive: true,
        count: 3
      });

      const recommendations = await AIRecommendationService.generateStudentRecommendations(
        testStudent._id,
        testProgram._id
      );

      expect(recommendations.some(r => 
        r.type === 'intervention' && 
        r.description.toLowerCase().includes('attendance')
      )).toBe(true);
    });

    it('should include learning style recommendations', async () => {
      // Update student with learning style information
      await mongoose.model('Student').findByIdAndUpdate(testStudent._id, {
        'learningProfile.learningStyle': 'visual',
        'learningProfile.interests': ['science', 'technology']
      });

      const recommendations = await AIRecommendationService.generateStudentRecommendations(
        testStudent._id
      );

      expect(recommendations.some(r => 
        r.type === 'adaptation' && 
        r.description.toLowerCase().includes('visual')
      )).toBe(true);
    });
  });

  describe('generateProgramRecommendations', () => {
    beforeEach(async () => {
      // Create multiple students with varying performance
      const createStudentsWithData = async (count, performanceLevel) => {
        for (let i = 0; i < count; i++) {
          const student = await testHelpers.createTestStudent(testOrg._id, [testProgram._id]);
          await testHelpers.createTestAssessment(student._id, testProgram._id, {
            score: performanceLevel,
            maxScore: 100
          });
          await testHelpers.createTestAttendance(student._id, testProgram._id);
        }
      };

      await createStudentsWithData(3, 90); // High performers
      await createStudentsWithData(4, 70); // Average performers
      await createStudentsWithData(3, 50); // Low performers
    });

    it('should analyze program effectiveness accurately', async () => {
      const recommendations = await AIRecommendationService.generateProgramRecommendations(
        testProgram._id
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify program-level recommendations
      expect(recommendations.some(r => 
        r.type === 'program_improvement'
      )).toBe(true);
    });

    it('should identify performance distribution patterns', async () => {
      const recommendations = await AIRecommendationService.generateProgramRecommendations(
        testProgram._id
      );

      // Should identify varied performance distribution
      expect(recommendations.some(r => 
        r.description.toLowerCase().includes('performance distribution') ||
        r.description.toLowerCase().includes('achievement gap')
      )).toBe(true);
    });
  });

  describe('analyzeAcademicPerformance', () => {
    it('should detect declining grade trends', async () => {
      // Create sequence of declining grades
      const grades = [90, 85, 80, 75, 70].map((score, index) => ({
        score,
        maxScore: 100,
        date: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000) // Weekly assessments
      }));

      for (const grade of grades) {
        await testHelpers.createTestAssessment(testStudent._id, testProgram._id, grade);
      }

      const insights = await AIRecommendationService.analyzeAcademicPerformance(
        testStudent,
        testProgram._id
      );

      expect(insights.some(i => 
        i.type === 'intervention' && 
        i.description.toLowerCase().includes('declining')
      )).toBe(true);
    });

    it('should identify subject-specific weaknesses', async () => {
      // Create assessments with varying performance in different subjects
      const subjects = {
        'Math': 90,
        'Science': 85,
        'English': 60
      };

      for (const [subject, score] of Object.entries(subjects)) {
        await testHelpers.createTestAssessment(testStudent._id, testProgram._id, {
          name: `${subject} Test`,
          score,
          maxScore: 100
        });
      }

      const insights = await AIRecommendationService.analyzeAcademicPerformance(
        testStudent,
        testProgram._id
      );

      expect(insights.some(i => 
        i.type === 'improvement' && 
        i.description.toLowerCase().includes('english')
      )).toBe(true);
    });
  });

  describe('performHolisticAssessment', () => {
    it('should generate personalized learning recommendations', async () => {
      // Update student with comprehensive profile
      await mongoose.model('Student').findByIdAndUpdate(testStudent._id, {
        learningProfile: {
          learningStyle: 'kinesthetic',
          strengths: ['problem-solving', 'creativity'],
          challenges: ['time-management'],
          interests: ['music', 'sports'],
          accommodations: ['extended-time']
        }
      });

      const insights = await AIRecommendationService.performHolisticAssessment(
        await mongoose.model('Student').findById(testStudent._id)
      );

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some(i => 
        i.type === 'adaptation' &&
        i.description.toLowerCase().includes('kinesthetic')
      )).toBe(true);
      expect(insights.some(i => 
        i.type === 'engagement' &&
        (i.description.toLowerCase().includes('music') || 
         i.description.toLowerCase().includes('sports'))
      )).toBe(true);
    });
  });
});
