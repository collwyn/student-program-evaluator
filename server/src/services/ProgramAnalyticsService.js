const mongoose = require('mongoose');
const Program = require('../models/Program');
const Student = require('../models/Student');

class ProgramAnalyticsService {
  static async calculateProgramEffectiveness(programId) {
    try {
      const program = await Program.findById(programId);
      const students = await Student.find({ programIds: programId });
      
      // Base metrics calculation
      const metrics = {
        studentCount: students.length,
        completionRate: 0,
        averageGPA: 0,
        attendanceRate: 0,
        satisfactionScore: 0,
        progressRate: 0
      };

      if (students.length === 0) return metrics;

      // Calculate complex metrics
      let totalGPA = 0;
      let totalAttendance = 0;
      let completedCount = 0;
      let totalProgress = 0;

      for (const student of students) {
        // GPA calculation
        totalGPA += student.academicProfile.performanceMetrics.overallGPA || 0;

        // Attendance tracking
        const studentAttendance = student.attendance.filter(a => 
          a.programId.toString() === programId.toString()
        );
        const attendanceRate = studentAttendance.length > 0 
          ? (studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100
          : 0;
        totalAttendance += attendanceRate;

        // Completion tracking
        if (student.academicProfile.status === 'graduated') {
          completedCount++;
        }

        // Progress calculation
        const completedGoals = student.progressTracking.goals.filter(g => g.status === 'completed').length;
        const totalGoals = student.progressTracking.goals.length || 1;
        totalProgress += (completedGoals / totalGoals) * 100;
      }

      // Calculate final metrics
      metrics.averageGPA = totalGPA / students.length;
      metrics.attendanceRate = totalAttendance / students.length;
      metrics.completionRate = (completedCount / students.length) * 100;
      metrics.progressRate = totalProgress / students.length;

      // Calculate effectiveness score using weighted metrics
      const effectivenessScore = this.calculateEffectivenessScore(metrics);

      // Generate AI recommendations
      const recommendations = await this.generateRecommendations(metrics, program);

      return {
        ...metrics,
        effectivenessScore,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating program effectiveness:', error);
      throw error;
    }
  }

  static calculateEffectivenessScore(metrics) {
    // Weighted scoring algorithm
    const weights = {
      completionRate: 0.3,
      averageGPA: 0.25,
      attendanceRate: 0.2,
      progressRate: 0.25
    };

    return (
      (metrics.completionRate * weights.completionRate) +
      ((metrics.averageGPA / 4) * 100 * weights.averageGPA) +
      (metrics.attendanceRate * weights.attendanceRate) +
      (metrics.progressRate * weights.progressRate)
    );
  }

  static async generateRecommendations(metrics, program) {
    const recommendations = [];

    // Performance-based recommendations
    if (metrics.averageGPA < 3.0) {
      recommendations.push({
        type: 'improvement',
        description: 'Consider implementing additional academic support sessions to improve overall GPA',
        priority: 'high'
      });
    }

    if (metrics.attendanceRate < 85) {
      recommendations.push({
        type: 'intervention',
        description: 'Attendance rates are below target. Consider implementing engagement strategies and attendance monitoring',
        priority: 'medium'
      });
    }

    if (metrics.progressRate < 70) {
      recommendations.push({
        type: 'improvement',
        description: 'Student progress rate indicates potential barriers. Review curriculum pacing and student support systems',
        priority: 'high'
      });
    }

    // Resource optimization recommendations
    if (metrics.studentCount > 0) {
      const completionTrend = metrics.completionRate < 75;
      if (completionTrend) {
        recommendations.push({
          type: 'resource',
          description: 'Low completion rates detected. Consider reviewing program structure and providing additional resources',
          priority: 'high'
        });
      }
    }

    return recommendations;
  }

  static async generatePerformanceReport(programId, timeframe = '6months') {
    try {
      const program = await Program.findById(programId);
      const students = await Student.find({ programIds: programId });
      
      // Generate time-series data for tracking metrics over time
      const timeSeriesData = await this.calculateTimeSeriesMetrics(programId, timeframe);
      
      // Calculate comparative analytics
      const benchmarks = await this.calculateProgramBenchmarks(program.organizationId, program.type);
      
      return {
        program: program.name,
        timeSeriesData,
        benchmarks,
        recommendations: await this.generateRecommendations({ 
          ...timeSeriesData.current 
        }, program)
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  static async calculateTimeSeriesMetrics(programId, timeframe) {
    // Implementation for time-series metrics calculation
    // This would analyze historical data points and generate trends
    return {
      current: {},
      historical: [],
      trends: {}
    };
  }

  static async calculateProgramBenchmarks(organizationId, programType) {
    // Implementation for calculating program benchmarks
    // This would compare against similar programs within the organization
    return {
      organizationAverage: {},
      similarProgramsAverage: {},
      topPerformerMetrics: {}
    };
  }
}

module.exports = ProgramAnalyticsService;
