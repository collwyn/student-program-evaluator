const Program = require('../models/Program');
const Student = require('../models/Student');
const ProgramAnalyticsService = require('../services/ProgramAnalyticsService');

class ProgramController {
  static async createProgram(req, res) {
    try {
      const programData = {
        ...req.body,
        organizationId: req.user.organizationId
      };
      
      const program = await Program.create(programData);
      res.status(201).json({ success: true, data: program });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getPrograms(req, res) {
    try {
      const { 
        effectiveness, 
        type, 
        status,
        sort = 'name',
        page = 1,
        limit = 10
      } = req.query;

      const query = { organizationId: req.user.organizationId };

      // Apply filters
      if (effectiveness) {
        query['metrics.effectivenessScore'] = { 
          $gte: parseFloat(effectiveness) 
        };
      }
      if (type) query.type = type;
      if (status) query.status = status;

      const options = {
        sort: sort.startsWith('-') ? 
          { [sort.substring(1)]: -1 } : 
          { [sort]: 1 },
        page: parseInt(page),
        limit: parseInt(limit),
        populate: 'students'
      };

      const programs = await Program.paginate(query, options);
      res.json({ success: true, data: programs });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getProgramById(req, res) {
    try {
      const program = await Program.findOne({
        _id: req.params.id,
        organizationId: req.user.organizationId
      }).populate('students');

      if (!program) {
        return res.status(404).json({ 
          success: false, 
          error: 'Program not found' 
        });
      }

      res.json({ success: true, data: program });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateProgram(req, res) {
    try {
      const program = await Program.findOneAndUpdate(
        {
          _id: req.params.id,
          organizationId: req.user.organizationId
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!program) {
        return res.status(404).json({ 
          success: false, 
          error: 'Program not found' 
        });
      }

      res.json({ success: true, data: program });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getProgramEffectiveness(req, res) {
    try {
      const programId = req.params.id;
      
      // Verify program belongs to organization
      const program = await Program.findOne({
        _id: programId,
        organizationId: req.user.organizationId
      });

      if (!program) {
        return res.status(404).json({ 
          success: false, 
          error: 'Program not found' 
        });
      }

      const effectiveness = await ProgramAnalyticsService
        .calculateProgramEffectiveness(programId);

      res.json({ success: true, data: effectiveness });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getProgramReport(req, res) {
    try {
      const programId = req.params.id;
      const { timeframe } = req.query;

      // Verify program belongs to organization
      const program = await Program.findOne({
        _id: programId,
        organizationId: req.user.organizationId
      });

      if (!program) {
        return res.status(404).json({ 
          success: false, 
          error: 'Program not found' 
        });
      }

      const report = await ProgramAnalyticsService
        .generatePerformanceReport(programId, timeframe);

      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStudentPerformance(req, res) {
    try {
      const { programId, studentId } = req.params;

      // Verify program and student belong to organization
      const [program, student] = await Promise.all([
        Program.findOne({
          _id: programId,
          organizationId: req.user.organizationId
        }),
        Student.findOne({
          _id: studentId,
          organizationId: req.user.organizationId,
          programIds: programId
        })
      ]);

      if (!program || !student) {
        return res.status(404).json({ 
          success: false, 
          error: 'Program or student not found' 
        });
      }

      // Get student's assessments for this program
      const assessments = student.assessments
        .filter(a => a.programId.toString() === programId);

      // Get student's attendance for this program
      const attendance = student.attendance
        .filter(a => a.programId.toString() === programId);

      // Calculate performance metrics
      const performance = {
        student: {
          id: student._id,
          name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`
        },
        assessments,
        attendance,
        metrics: {
          averageScore: assessments.length > 0 
            ? assessments.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0) / assessments.length 
            : null,
          attendanceRate: attendance.length > 0
            ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
            : null
        }
      };

      res.json({ success: true, data: performance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ProgramController;
