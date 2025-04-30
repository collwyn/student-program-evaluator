# Running Your First Test - Step by Step Guide

## Prerequisites Setup

1. First, make sure you have Node.js installed:
```bash
node --version
```
Should show v14.0.0 or higher

2. Install dependencies:
```bash
npm install
```

## Running Your First Test

1. Navigate to the project directory in your terminal:
```bash
cd your-project-directory
```

2. Run the example test:
```bash
jest examples/FirstTest.test.js
```

## Understanding the Test Output

When you run the test, you'll see output like this:
```
PASS examples/FirstTest.test.js
  Your First Test Suite
    ✓ student object has required properties (3ms)
    ✓ async test example (5ms)
    ✓ handles errors properly (1ms)
    ✓ mock function example (1ms)
    ✓ various assertion examples (2ms)
    ✓ beforeEach example (1ms)
    ✓ beforeEach runs before each test (1ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        1.5s
```

### What Each Test Does:

1. **student object has required properties**
   - Checks if the student object structure is correct
   - Verifies specific values in the object

2. **async test example**
   - Shows how to test asynchronous code
   - Demonstrates API call mocking

3. **handles errors properly**
   - Shows how to test error cases
   - Demonstrates error handling testing

4. **mock function example**
   - Shows how to create and use mock functions
   - Demonstrates testing function calls

5. **various assertion examples**
   - Shows different types of assertions
   - Demonstrates common testing scenarios

6. **beforeEach examples**
   - Shows how setup code works
   - Demonstrates test isolation

## Try Modifying the Tests

1. Change some expected values:
```javascript
// In FirstTest.test.js
test('student object has required properties', () => {
  expect(sampleStudent.personalInfo.firstName).toBe('Jane'); // Change from 'John'
});
```

2. Run the tests again to see the failure:
```bash
npm test examples/FirstTest.test.js
```

You should see an error like:
```
Expected: "Jane"
Received: "John"
```

## Common Testing Patterns to Try

1. Testing Equal Values:
```javascript
expect(value).toBe(expectedValue);
```

2. Testing Object Properties:
```javascript
expect(object).toHaveProperty('property.name');
```

3. Testing Numbers:
```javascript
expect(number).toBeGreaterThan(min);
expect(number).toBeLessThan(max);
```

4. Testing Strings:
```javascript
expect(string).toMatch(/pattern/);
```

5. Testing Arrays:
```javascript
expect(array).toContain(item);
```

## Debugging Tests

If a test fails, you can:

1. Use console.log:
```javascript
test('debugging example', () => {
  console.log('Test value:', actualValue);
  expect(actualValue).toBe(expectedValue);
});
```

2. Run tests in watch mode:
```bash
jest --watch examples/FirstTest.test.js
```

3. Use the debugger:
```javascript
test('debug this test', () => {
  debugger;
  // Your test code
});
```

## Next Steps

After running these basic tests:

1. Try writing your own test:
```javascript
test('my new test', () => {
  // Your test logic here
});
```

2. Experiment with different assertions:
- toBeTruthy()
- toBeFalsy()
- toEqual()
- toBeNull()
- toBeUndefined()

3. Try testing async functions:
```javascript
test('async function', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

4. Practice with mock functions:
```javascript
const mockFn = jest.fn();
mockFn('test');
expect(mockFn).toHaveBeenCalledWith('test');
```

## Common Issues and Solutions

1. **Test not found:**
   - Check file naming (should end with .test.js)
   - Verify file path is correct

2. **Async test timeout:**
   - Add await to async operations
   - Increase timeout if needed:
   ```javascript
   jest.setTimeout(10000);
   ```

3. **Mock not working:**
   - Verify mock is defined before use
   - Check mock implementation

4. **Test pollution:**
   - Use beforeEach for setup
   - Use afterEach for cleanup

Remember:
- Tests should be independent
- Each test should test one thing
- Use descriptive test names
- Clean up after your tests
