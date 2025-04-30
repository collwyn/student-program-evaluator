# Testing Guide for Student Evaluation SaaS

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- MongoDB (for local development)

## Setup Instructions

1. Install Dependencies:
```bash
npm install
```

## Running Tests

### Basic Test Commands:

1. Run All Tests:
```bash
npm test
```
This will run both server and client tests sequentially.

2. Run Server Tests Only:
```bash
npm run test:server
```

3. Run Client Tests Only:
```bash
npm run test:client
```

4. Run Tests with Watch Mode:
```bash
npm run test:watch
```
This is useful during development as it will automatically rerun tests when files change.

5. Generate Coverage Report:
```bash
npm run test:coverage
```
The coverage report will be available in the `coverage` directory.

### Understanding Test Output

When you run tests, you'll see output like this:

```
PASS src/components/dashboard/__tests__/StudentDashboard.test.jsx
  StudentDashboard
    ✓ shows loading state initially (23ms)
    ✓ displays student information after loading (156ms)
    ✓ handles tab navigation (89ms)
    ✓ displays performance charts (45ms)
    ✓ handles API errors (67ms)
```

- ✓ means the test passed
- ✗ means the test failed
- Each test shows its execution time

### Coverage Reports

Coverage reports show how much of your code is tested:
- Statements: How many code statements are tested
- Branches: How many if/else paths are tested
- Functions: How many functions are tested
- Lines: How many code lines are tested

### Testing Different Features

1. Testing Student Dashboard:
- Navigate to student profiles
- Check performance metrics
- Verify charts and graphs
- Test data filtering

2. Testing Program Management:
- Create new programs
- Update program details
- Check program analytics
- Verify effectiveness metrics

3. Testing Data Import/Export:
- Upload CSV files
- Download reports
- Verify data formatting
- Check error handling

### Common Testing Scenarios

1. Authentication Tests:
```javascript
// Example: Testing login
test('should log in successfully with valid credentials', async () => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  expect(response.ok).toBe(true);
});
```

2. Student Data Tests:
```javascript
// Example: Testing student creation
test('should create new student', async () => {
  const studentData = {
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU001'
  };
  const response = await fetch('/api/students', {
    method: 'POST',
    body: JSON.stringify(studentData)
  });
  expect(response.ok).toBe(true);
});
```

### Troubleshooting Common Issues

1. Test Failures:
- Check the error message in the test output
- Verify test data and mocks
- Check for async/await usage
- Ensure database connection (for server tests)

2. Coverage Issues:
- Look for untested code paths
- Check conditional statements
- Verify error handlers are tested
- Add edge case scenarios

3. Performance Issues:
- Check for memory leaks
- Verify cleanup after tests
- Use appropriate timeouts
- Mock heavy operations

### Best Practices

1. Writing Tests:
- Test one thing at a time
- Use descriptive test names
- Keep tests independent
- Clean up after each test

2. Maintaining Tests:
- Update tests when code changes
- Keep test data current
- Remove obsolete tests
- Monitor test coverage

### Getting Help

If you encounter issues:
1. Check the error message carefully
2. Look for similar tests in the codebase
3. Review the testing documentation
4. Ask for help in the project repository

## Advanced Testing

1. Debug Tests:
```bash
npm run test:debug
```
This will allow you to use Chrome DevTools for debugging.

2. CI/CD Testing:
```bash
npm run test:ci
```
Use this command in continuous integration environments.

Remember: Good tests help maintain code quality and prevent regressions. Take time to write comprehensive tests for new features and bug fixes.
