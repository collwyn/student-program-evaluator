# Test Data Examples

## Student Test Data

```javascript
// Example student data for testing
const studentExample = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    studentId: "STU001",
    dateOfBirth: "2005-01-15"
  },
  academicProfile: {
    grade: "10",
    status: "active",
    performanceMetrics: {
      overallGPA: 3.8,
      attendanceRate: 95,
      participationScore: 88
    }
  }
};

// Example assessment data
const assessmentExample = {
  type: "exam",
  name: "Midterm Examination",
  score: 85,
  maxScore: 100,
  date: "2023-10-15",
  feedback: "Good performance in theoretical concepts"
};

// Example attendance record
const attendanceExample = {
  date: "2023-10-15",
  status: "present",
  notes: "Participated actively in class discussion"
};
```

## Program Test Data

```javascript
// Example program data
const programExample = {
  name: "Advanced Mathematics",
  description: "Comprehensive mathematics program for high school students",
  type: "academic",
  metrics: {
    effectivenessScore: 85,
    studentSatisfaction: 4.5,
    averagePerformance: 88,
    completionRate: 92
  },
  assessmentCriteria: [
    {
      name: "Exam Performance",
      weight: 40,
      minimumScore: 60
    },
    {
      name: "Assignments",
      weight: 30,
      minimumScore: 70
    },
    {
      name: "Class Participation",
      weight: 30,
      minimumScore: 75
    }
  ]
};
```

## CSV Import Test Data

```csv
firstName,lastName,studentId,email,dateOfBirth,grade,gpa,attendanceRate
John,Doe,STU001,john@example.com,2005-01-15,10,3.8,95
Jane,Smith,STU002,jane@example.com,2005-03-20,10,3.9,98
Bob,Johnson,STU003,bob@example.com,2005-05-10,10,3.5,92
```

## API Test Examples

### 1. Creating a New Student
```javascript
test('create new student', async () => {
  const response = await fetch('/api/v1/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify(studentExample)
  });

  expect(response.status).toBe(201);
  expect(response.ok).toBe(true);
});
```

### 2. Testing Program Analytics
```javascript
test('get program effectiveness', async () => {
  const response = await fetch(`/api/v1/programs/${programId}/effectiveness`, {
    headers: {
      'Authorization': `Bearer ${testToken}`
    }
  });

  const data = await response.json();
  expect(data.effectivenessScore).toBeGreaterThanOrEqual(0);
  expect(data.effectivenessScore).toBeLessThanOrEqual(100);
});
```

### 3. Testing Data Import
```javascript
test('import student data', async () => {
  const csvFile = new File(
    [csvContent],
    'students.csv',
    { type: 'text/csv' }
  );

  const formData = new FormData();
  formData.append('file', csvFile);

  const response = await fetch('/api/v1/import/students', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testToken}`
    },
    body: formData
  });

  expect(response.ok).toBe(true);
});
```

## Component Test Examples

### 1. Testing Student Dashboard
```javascript
test('student dashboard displays correct information', async () => {
  render(<StudentDashboard studentId="STU001" />);

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('3.8')).toBeInTheDocument(); // GPA
    expect(screen.getByText('95%')).toBeInTheDocument(); // Attendance
  });
});
```

### 2. Testing Program Analytics
```javascript
test('program analytics shows effectiveness metrics', async () => {
  render(<ProgramAnalytics programId="PROG001" />);

  await waitFor(() => {
    expect(screen.getByText('Effectiveness Score')).toBeInTheDocument();
    expect(screen.getByTestId('effectiveness-chart')).toBeInTheDocument();
  });
});
```

## Mock Examples

### 1. API Response Mocks
```javascript
const mockSuccessResponse = {
  success: true,
  data: studentExample
};

const mockErrorResponse = {
  success: false,
  error: 'Student not found'
};

// Using mocks in tests
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockSuccessResponse)
  })
);
```

### 2. Chart.js Mocks
```javascript
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}));
```

## Testing Edge Cases

```javascript
// Test invalid student data
test('handles invalid student data', async () => {
  const invalidStudent = {
    ...studentExample,
    personalInfo: {
      ...studentExample.personalInfo,
      email: 'invalid-email' // Invalid email format
    }
  };

  const response = await fetch('/api/v1/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify(invalidStudent)
  });

  expect(response.status).toBe(400);
});

// Test empty program data
test('handles empty program data', async () => {
  render(<ProgramAnalytics programId="EMPTY_PROGRAM" />);

  await waitFor(() => {
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
```

Remember to:
- Use these examples as templates for your own tests
- Modify the data to match your specific testing needs
- Add more edge cases based on your application requirements
- Keep test data consistent across related tests
