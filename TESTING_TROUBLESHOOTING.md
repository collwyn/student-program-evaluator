# Testing Troubleshooting Guide

## Common Testing Issues and Solutions

### 1. Test Setup Problems

#### Problem: Tests Not Running
```bash
Error: No tests found
```

**Solutions:**
1. Check file naming:
   - Test files should end with `.test.js` or `.spec.js`
   - Test files should be in `__tests__` directories

2. Verify test structure:
```javascript
// Correct structure
describe('Component/Feature Name', () => {
  test('should do something', () => {
    // test code
  });
});
```

#### Problem: Environment Setup
```bash
Error: Cannot find module '@testing-library/react'
```

**Solutions:**
1. Install dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

2. Check setupTests.js is imported:
```javascript
import '@testing-library/jest-dom';
```

### 2. Async Testing Issues

#### Problem: Tests Completing Before Async Operations
```javascript
// Failing test
test('async operation', () => {
  const result = fetchData();
  expect(result).toBeDefined(); // Fails because fetchData is async
});
```

**Solutions:**
1. Use async/await:
```javascript
test('async operation', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

2. Use waitFor for UI updates:
```javascript
test('component update', async () => {
  render(<MyComponent />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 3. Mock Related Issues

#### Problem: Fetch Mock Not Working
```bash
Error: fetch is not defined
```

**Solutions:**
1. Setup fetch mock:
```javascript
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});
```

2. Mock fetch responses:
```javascript
fetch.mockResponseOnce(JSON.stringify({ data: 'test' }));
```

#### Problem: Module Mock Not Working
```bash
Error: Cannot mock non-existent module
```

**Solutions:**
1. Create manual mock:
```javascript
// __mocks__/chartjs.js
module.exports = {
  Chart: {
    register: jest.fn()
  }
};
```

2. Mock module in test file:
```javascript
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  }
}));
```

### 4. React Component Testing Issues

#### Problem: Component Not Rendering
```bash
Error: Element not found in document
```

**Solutions:**
1. Check render method:
```javascript
test('component renders', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

2. Use correct queries:
```javascript
// Better practices
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Username');
screen.getByTestId('submit-button');
```

#### Problem: Event Handlers Not Firing
```javascript
test('button click', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled(); // Fails
});
```

**Solutions:**
1. Use userEvent instead of fireEvent:
```javascript
import userEvent from '@testing-library/user-event';

test('button click', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick} />);
  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### 5. Coverage Issues

#### Problem: Low Coverage Reports
```bash
Warning: Coverage threshold not met
```

**Solutions:**
1. Identify uncovered code:
```bash
npm run test:coverage
```

2. Add missing test cases:
```javascript
// Test edge cases
test('handles empty input', () => {
  expect(myFunction('')).toBe(defaultValue);
});

test('handles null input', () => {
  expect(myFunction(null)).toBe(defaultValue);
});
```

### 6. Performance Issues

#### Problem: Slow Tests
```bash
Warning: Test took longer than 5000ms
```

**Solutions:**
1. Mock heavy operations:
```javascript
jest.mock('./heavyOperation', () => ({
  heavyOperation: jest.fn().mockResolvedValue('result')
}));
```

2. Use more specific test selectors:
```javascript
// Better performance
screen.getByTestId('specific-element');
// Instead of
screen.findByText(/some text/i);
```

### 7. Debug Techniques

#### Problem: Need to Debug Tests
**Solutions:**
1. Use test.only to run specific tests:
```javascript
test.only('debugging this test', () => {
  // Only this test will run
});
```

2. Use console.log with proper cleanup:
```javascript
let consoleOutput = [];
const mockConsole = (output) => consoleOutput.push(output);

beforeEach(() => {
  consoleOutput = [];
  console.log = mockConsole;
});

afterEach(() => {
  console.log = console.log;
});
```

3. Use debugger:
```javascript
test('debug test', () => {
  debugger; // Add debugger statement
  // Test code
});
```

### 8. Memory Leaks

#### Problem: Memory Leak Warnings
```bash
Warning: Memory leak detected
```

**Solutions:**
1. Cleanup after tests:
```javascript
afterEach(() => {
  cleanup(); // React Testing Library cleanup
  jest.clearAllMocks();
});
```

2. Unmount components:
```javascript
let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});
```

## Best Practices for Avoiding Issues

1. Always cleanup after tests
2. Use proper async/await syntax
3. Mock external dependencies
4. Use proper test isolation
5. Write focused, single-responsibility tests
6. Use meaningful test descriptions
7. Keep test files organized and well-structured
8. Regular maintenance of test suite

Remember: When in doubt, check the Jest and Testing Library documentation for more detailed solutions and best practices.
