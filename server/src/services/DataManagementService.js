const csv = require('csv-parse');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const Student = require('../models/Student');
const Program = require('../models/Program');
const mongoose = require('mongoose');

class DataManagementService {
  static async importStudentData(organizationId, fileBuffer, programId = null) {
    try {
      const records = await this.parseCsvBuffer(fileBuffer);
      const importedStudents = [];
      const errors = [];

      for (const [index, record] of records.entries()) {
        try {
          // Validate required fields
          if (!record.firstName || !record.lastName || !record.studentId) {
            throw new Error('Missing required fields');
          }

          // Check for existing student
          let student = await Student.findOne({
            organizationId,
            'personalInfo.studentId': record.studentId
          });

          const studentData = {
            organizationId,
            personalInfo: {
              firstName: record.firstName,
              lastName: record.lastName,
              studentId: record.studentId,
              email: record.email,
              dateOfBirth: record.dateOfBirth
            },
            academicProfile: {
              grade: record.grade,
              enrollmentDate: record.enrollmentDate || new Date(),
              performanceMetrics: {
                overallGPA: record.gpa || null,
                attendanceRate: record.attendanceRate || null
              }
            }
          };

          if (programId) {
            studentData.programIds = [programId];
          }

          if (student) {
            // Update existing student
            student = await Student.findByIdAndUpdate(
              student._id,
              { $set: studentData },
              { new: true }
            );
          } else {
            // Create new student
            student = await Student.create(studentData);
          }

          importedStudents.push(student);
        } catch (error) {
          errors.push({
            row: index + 2, // +2 for header row and 0-based index
            error: error.message,
            record
          });
        }
      }

      return {
        success: true,
        imported: importedStudents.length,
        errors,
        students: importedStudents
      };
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  static async exportStudentData(organizationId, filters = {}) {
    try {
      const query = { organizationId, ...filters };
      const students = await Student.find(query)
        .populate('programIds', 'name')
        .lean();

      const csvStringifier = createCsvStringifier({
        header: [
          { id: 'studentId', title: 'Student ID' },
          { id: 'firstName', title: 'First Name' },
          { id: 'lastName', title: 'Last Name' },
          { id: 'email', title: 'Email' },
          { id: 'dateOfBirth', title: 'Date of Birth' },
          { id: 'grade', title: 'Grade' },
          { id: 'gpa', title: 'GPA' },
          { id: 'attendanceRate', title: 'Attendance Rate' },
          { id: 'programs', title: 'Programs' },
          { id: 'status', title: 'Status' }
        ]
      });

      const records = students.map(student => ({
        studentId: student.personalInfo.studentId,
        firstName: student.personalInfo.firstName,
        lastName: student.personalInfo.lastName,
        email: student.personalInfo.email,
        dateOfBirth: student.personalInfo.dateOfBirth,
        grade: student.academicProfile.grade,
        gpa: student.academicProfile.performanceMetrics.overallGPA,
        attendanceRate: student.academicProfile.performanceMetrics.attendanceRate,
        programs: student.programIds.map(p => p.name).join('; '),
        status: student.academicProfile.status
      }));

      return {
        csv: csvStringifier.stringifyRecords(records),
        count: records.length
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  static async exportProgramReport(programId, organizationId) {
    try {
      const program = await Program.findOne({ _id: programId, organizationId })
        .populate({
          path: 'students',
          select: 'personalInfo academicProfile assessments attendance'
        });

      if (!program) {
        throw new Error('Program not found');
      }

      const csvStringifier = createCsvStringifier({
        header: [
          { id: 'studentId', title: 'Student ID' },
          { id: 'name', title: 'Student Name' },
          { id: 'overallGPA', title: 'Overall GPA' },
          { id: 'attendanceRate', title: 'Attendance Rate' },
          { id: 'assessmentAverage', title: 'Assessment Average' },
          { id: 'status', title: 'Status' }
        ]
      });

      const records = program.students.map(student => {
        const programAssessments = student.assessments.filter(
          a => a.programId.toString() === programId
        );

        const assessmentAverage = programAssessments.length > 0
          ? programAssessments.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0) / programAssessments.length
          : null;

        return {
          studentId: student.personalInfo.studentId,
          name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
          overallGPA: student.academicProfile.performanceMetrics.overallGPA,
          attendanceRate: student.academicProfile.performanceMetrics.attendanceRate,
          assessmentAverage,
          status: student.academicProfile.status
        };
      });

      return {
        csv: csvStringifier.stringifyRecords(records),
        count: records.length
      };
    } catch (error) {
      throw new Error(`Program report export failed: ${error.message}`);
    }
  }

  static async parseCsvBuffer(buffer) {
    return new Promise((resolve, reject) => {
      csv.parse(buffer, {
        columns: true,
        trim: true,
        skip_empty_lines: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });
  }
}

module.exports = DataManagementService;
