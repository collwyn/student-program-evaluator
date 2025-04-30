const DataManagementService = require('../../services/DataManagementService');
const Student = require('../../models/Student');
const Program = require('../../models/Program');
const fs = require('fs').promises;
const path = require('path');

describe('DataManagementService', () => {
  let testOrg;
  let testProgram;
  let csvBuffer;

  beforeAll(async () => {
    testOrg = await testHelpers.createTestOrganization();
    testProgram = await testHelpers.createTestProgram(testOrg._id);
  });

  describe('importStudentData', () => {
    beforeEach(() => {
      // Create sample CSV data
      const csvData = `firstName,lastName,studentId,email,dateOfBirth,grade,gpa,attendanceRate
John,Doe,STU001,john@example.com,2005-01-15,10,3.8,95
Jane,Smith,STU002,jane@example.com,2005-03-20,10,3.9,98
Invalid,,STU003,,,,,,`;

      csvBuffer = Buffer.from(csvData);
    });

    it('should successfully import valid student records', async () => {
      const result = await DataManagementService.importStudentData(
        testOrg._id,
        csvBuffer
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2); // Two valid records
      expect(result.errors.length).toBe(1); // One invalid record

      // Verify imported students
      const students = await Student.find({ organizationId: testOrg._id });
      expect(students.length).toBe(2);

      const johnDoe = students.find(s => s.personalInfo.studentId === 'STU001');
      expect(johnDoe).toBeTruthy();
      expect(johnDoe.personalInfo.firstName).toBe('John');
      expect(johnDoe.academicProfile.performanceMetrics.overallGPA).toBe(3.8);
    });

    it('should handle duplicate student IDs correctly', async () => {
      // First import
      await DataManagementService.importStudentData(testOrg._id, csvBuffer);

      // Modify some data and reimport
      const updatedCsvData = `firstName,lastName,studentId,email,dateOfBirth,grade,gpa,attendanceRate
John,Doe-Updated,STU001,john.updated@example.com,2005-01-15,10,3.9,96`;

      const result = await DataManagementService.importStudentData(
        testOrg._id,
        Buffer.from(updatedCsvData)
      );

      expect(result.success).toBe(true);
      
      // Verify student was updated
      const updatedStudent = await Student.findOne({
        organizationId: testOrg._id,
        'personalInfo.studentId': 'STU001'
      });
      
      expect(updatedStudent.personalInfo.lastName).toBe('Doe-Updated');
      expect(updatedStudent.personalInfo.email).toBe('john.updated@example.com');
      expect(updatedStudent.academicProfile.performanceMetrics.overallGPA).toBe(3.9);
    });

    it('should associate students with program when programId is provided', async () => {
      const result = await DataManagementService.importStudentData(
        testOrg._id,
        csvBuffer,
        testProgram._id
      );

      expect(result.success).toBe(true);

      // Verify program association
      const students = await Student.find({ organizationId: testOrg._id });
      students.forEach(student => {
        expect(student.programIds).toContain(testProgram._id);
      });
    });
  });

  describe('exportStudentData', () => {
    beforeEach(async () => {
      // Create test students with various data
      await Promise.all([
        testHelpers.createTestStudent(testOrg._id, [testProgram._id], {
          personalInfo: {
            firstName: 'Export',
            lastName: 'Test1',
            studentId: 'EXP001'
          },
          academicProfile: {
            performanceMetrics: {
              overallGPA: 3.7
            }
          }
        }),
        testHelpers.createTestStudent(testOrg._id, [testProgram._id], {
          personalInfo: {
            firstName: 'Export',
            lastName: 'Test2',
            studentId: 'EXP002'
          },
          academicProfile: {
            performanceMetrics: {
              overallGPA: 3.5
            }
          }
        })
      ]);
    });

    it('should export all students in correct CSV format', async () => {
      const result = await DataManagementService.exportStudentData(testOrg._id);

      expect(result.count).toBe(2);
      expect(result.csv).toBeTruthy();

      // Verify CSV structure
      const csvLines = result.csv.split('\n');
      expect(csvLines[0]).toContain('Student ID,First Name,Last Name'); // Header
      expect(csvLines).toHaveLength(3); // Header + 2 students
      expect(csvLines[1]).toContain('EXP001,Export,Test1');
    });

    it('should apply filters when exporting', async () => {
      const result = await DataManagementService.exportStudentData(testOrg._id, {
        gpa: 3.6
      });

      expect(result.count).toBe(1);
      const csvLines = result.csv.split('\n');
      expect(csvLines).toHaveLength(2); // Header + 1 filtered student
      expect(csvLines[1]).toContain('EXP001'); // Only the student with GPA 3.7
    });
  });

  describe('exportProgramReport', () => {
    beforeEach(async () => {
      // Create test students with assessments and attendance
      const student = await testHelpers.createTestStudent(testOrg._id, [testProgram._id]);
      await testHelpers.createTestAssessment(student._id, testProgram._id);
      await testHelpers.createTestAttendance(student._id, testProgram._id);
    });

    it('should generate comprehensive program report', async () => {
      const result = await DataManagementService.exportProgramReport(
        testProgram._id,
        testOrg._id
      );

      expect(result.count).toBeGreaterThan(0);
      expect(result.csv).toBeTruthy();

      // Verify CSV structure
      const csvLines = result.csv.split('\n');
      expect(csvLines[0]).toContain('Student ID,Student Name,Overall GPA');
      expect(csvLines[1]).toBeTruthy(); // Should have at least one student record
    });

    it('should handle programs with no students', async () => {
      const emptyProgram = await testHelpers.createTestProgram(testOrg._id);
      const result = await DataManagementService.exportProgramReport(
        emptyProgram._id,
        testOrg._id
      );

      expect(result.count).toBe(0);
      expect(result.csv).toBeTruthy();
      // Should still have header row
      expect(result.csv.split('\n')[0]).toContain('Student ID');
    });
  });

  describe('parseCsvBuffer', () => {
    it('should parse valid CSV data correctly', async () => {
      const csvData = `header1,header2,header3
value1,value2,value3
value4,value5,value6`;

      const result = await DataManagementService.parseCsvBuffer(Buffer.from(csvData));

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        header1: 'value1',
        header2: 'value2',
        header3: 'value3'
      });
    });

    it('should handle empty lines and trim whitespace', async () => {
      const csvData = `header1,header2
value1,  value2  

value3,value4  `;

      const result = await DataManagementService.parseCsvBuffer(Buffer.from(csvData));

      expect(result.length).toBe(2);
      expect(result[0].header2).toBe('value2');
      expect(result[1].header2).toBe('value4');
    });

    it('should throw error for invalid CSV format', async () => {
      const invalidCsv = `header1,header2
value1,value2,extra
value3`;

      await expect(
        DataManagementService.parseCsvBuffer(Buffer.from(invalidCsv))
      ).rejects.toThrow();
    });
  });
});
