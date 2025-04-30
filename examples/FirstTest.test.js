const Student = require('../server/src/models/Student');

describe('Your First Test Suite', () => {
  // Test data you can use
  const sampleStudent = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      studentId: 'STU001'
    },
    academicProfile: {
      grade: '10',
      status: 'active',
      performanceMetrics: {
        overallGPA: 3.8,
        attendanceRate: 95
      }
    }
  };

  // Simple test to check if an object has required properties
  test('student object has required properties', () => {
    expect(sampleStudent.personalInfo).toBeDefined();
    expect(sampleStudent.personalInfo.firstName).toBe('John');
    expect(sampleStudent.personalInfo.lastName).toBe('Doe');
    expect(sampleStudent.academicProfile.performanceMetrics.overallGPA).toBe(3.8);
  });

  // Test with async/await example
  test('async test example', async () => {
    // Mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleStudent })
      })
    );

    // Make API call
    const response = await fetch('/api/students/STU001');
    const result = await response.json();

    // Check response
    expect(result.data.personalInfo.studentId).toBe('STU001');
  });

  // Test with error handling
  test('handles errors properly', () => {
    expect(() => {
      // This should throw an error
      const invalidGPA = sampleStudent.academicProfile.performanceMetrics.invalidField;
      console.log(invalidGPA.toString());
    }).toThrow();
  });

  // Test with mock function
  test('mock function example', () => {
    // Create a mock function
    const mockCallback = jest.fn(x => x + 1);

    // Use the mock function
    [1, 2, 3].forEach(mockCallback);

    // Check how the mock was called
    expect(mockCallback.mock.calls.length).toBe(3);
    expect(mockCallback.mock.results[0].value).toBe(2);
  });

  // Demonstrate different assertions
  test('various assertion examples', () => {
    // Equality
    expect(2 + 2).toBe(4);
    
    // Truthiness
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    
    // Numbers
    expect(sampleStudent.academicProfile.performanceMetrics.overallGPA).toBeGreaterThan(3.0);
    expect(sampleStudent.academicProfile.performanceMetrics.attendanceRate).toBeLessThanOrEqual(100);
    
    // Strings
    expect(sampleStudent.personalInfo.email).toMatch(/@example.com$/);
    
    // Arrays
    const array = [1, 2, 3];
    expect(array).toContain(2);
    
    // Objects
    expect(sampleStudent).toHaveProperty('personalInfo.firstName');
  });

  // Using beforeEach for setup
  let testValue;
  beforeEach(() => {
    testValue = 1;
  });

  test('beforeEach example', () => {
    expect(testValue).toBe(1);
    testValue += 1;
    expect(testValue).toBe(2);
  });

  test('beforeEach runs before each test', () => {
    expect(testValue).toBe(1); // Value reset by beforeEach
  });
});
