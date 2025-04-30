const express = require('express');
const router = express.Router();
const ProgramController = require('../controllers/ProgramController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Auth middleware for all routes
router.use(authMiddleware);

// Program routes
router.post('/programs', ProgramController.createProgram);
router.get('/programs', ProgramController.getPrograms);
router.get('/programs/:id', ProgramController.getProgramById);
router.put('/programs/:id', ProgramController.updateProgram);
router.get('/programs/:id/effectiveness', ProgramController.getProgramEffectiveness);
router.get('/programs/:id/report', ProgramController.getProgramReport);
router.get('/programs/:programId/students/:studentId/performance', ProgramController.getStudentPerformance);

// Data Import/Export routes
const DataManagementController = {
  async importStudents(req, res) {
    try {
      const { programId } = req.query;
      const result = await DataManagementService.importStudentData(
        req.user.organizationId,
        req.file.buffer,
        programId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async exportStudents(req, res) {
    try {
      const result = await DataManagementService.exportStudentData(
        req.user.organizationId,
        req.query
      );
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      res.send(result.csv);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async exportProgramReport(req, res) {
    try {
      const result = await DataManagementService.exportProgramReport(
        req.params.id,
        req.user.organizationId
      );
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=program-report.csv');
      res.send(result.csv);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

router.post('/import/students', upload.single('file'), DataManagementController.importStudents);
router.get('/export/students', DataManagementController.exportStudents);
router.get('/programs/:id/export', DataManagementController.exportProgramReport);

// Analytics routes
const AnalyticsController = {
  async getProgramMetrics(req, res) {
    try {
      const programs = await Program.find({ organizationId: req.user.organizationId });
      const metrics = await Promise.all(
        programs.map(async program => {
          const effectiveness = await ProgramAnalyticsService.calculateProgramEffectiveness(program._id);
          return {
            programId: program._id,
            name: program.name,
            type: program.type,
            metrics: effectiveness
          };
        })
      );
      
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getOrganizationDashboard(req, res) {
    try {
      const programs = await Program.find({ organizationId: req.user.organizationId });
      const students = await Student.find({ organizationId: req.user.organizationId });
      
      const dashboard = {
        summary: {
          totalPrograms: programs.length,
          totalStudents: students.length,
          activePrograms: programs.filter(p => p.status === 'active').length,
          activeStudents: students.filter(s => s.academicProfile.status === 'active').length
        },
        programTypes: programs.reduce((acc, program) => {
          acc[program.type] = (acc[program.type] || 0) + 1;
          return acc;
        }, {}),
        performanceDistribution: {
          excellent: students.filter(s => s.academicProfile.performanceMetrics.overallGPA >= 3.5).length,
          good: students.filter(s => s.academicProfile.performanceMetrics.overallGPA >= 3.0 && s.academicProfile.performanceMetrics.overallGPA < 3.5).length,
          average: students.filter(s => s.academicProfile.performanceMetrics.overallGPA >= 2.0 && s.academicProfile.performanceMetrics.overallGPA < 3.0).length,
          needsImprovement: students.filter(s => s.academicProfile.performanceMetrics.overallGPA < 2.0).length
        }
      };
      
      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

router.get('/analytics/programs', AnalyticsController.getProgramMetrics);
router.get('/analytics/dashboard', AnalyticsController.getOrganizationDashboard);

module.exports = router;
