# Test Patterns Quick Reference Guide

## 1. Basic Test Patterns

### Simple Value Test
```javascript
test('basic value check', () => {
  const value = 1 + 1;
  expect(value).toBe(2);
});
```

### Object Test
```javascript
test('object properties', () => {
  const student = {
    name: 'John',
    grade: 'A'
  };
  expect(student).toHaveProperty('name', 'John');
  expect(student.grade).toBe('A');
});
```

## 2. Async Test Patterns

### Promise Test
```javascript
test('async function', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### API Call Test
```javascript
test('API endpoint', async () => {
  const response = await fetch('/api/students');
  const data = await response.json();
  expect(response.ok).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});
```

## 3. Component Test Patterns

### React Component Rendering
```javascript
test('component renders', () => {
  render(<StudentCard student={mockStudent} />);
  expect(screen.getByText(mockStudent.name)).toBeInTheDocument();
});
```

### User Interaction
```javascript
test('button click', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  await userEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalled();
});
```

## 4. Mock Patterns

### Function Mock
```javascript
test('mock function', () => {
  const mockFn = jest.fn();
  mockFn('test');
  expect(mockFn).toHaveBeenCalledWith('test');
});
```

### API Mock
```javascript
test('mock API call', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    })
  );

  const response = await callApi();
  expect(response.data).toBe('test');
});
```

## 5. Data Validation Patterns

### Number Validation
```javascript
test('number validation', () => {
  const score = 85;
  expect(score).toBeGreaterThan(0);
  expect(score).toBeLessThanOrEqual(100);
  expect(Number.isInteger(score)).toBe(true);
});
```

### String Validation
```javascript
test('string validation', () => {
  const email = 'test@example.com';
  expect(email).toMatch(/@/);
  expect(email.length).toBeGreaterThan(0);
});
```

## 6. Error Handling Patterns

### Exception Test
```javascript
test('throws error', () => {
  expect(() => {
    throwingFunction();
  }).toThrow('Expected error message');
});
```

### Async Error
```javascript
test('async error', async () => {
  await expect(asyncThrowingFunction()).rejects.toThrow();
});
```

## 7. Setup and Cleanup Patterns

### Before/After Hooks
```javascript
describe('test group', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  test('example test', () => {
    // Test code
  });
});
```

## 8. Common Testing Scenarios

### Form Submission
```javascript
test('form submission', async () => {
  render(<Form onSubmit={mockSubmit} />);
  
  await userEvent.type(screen.getByLabelText('Name'), 'John');
  await userEvent.click(screen.getByText('Submit'));
  
  expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' });
});
```

### Data Loading
```javascript
test('data loading', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await waitForElementToBeRemoved(() => screen.getByText('Loading...'));
  expect(screen.getByText('Data Loaded')).toBeInTheDocument();
});
```

## 9. Best Practices

### Arrange-Act-Assert Pattern
```javascript
test('follows AAA pattern', () => {
  // Arrange
  const calculator = new Calculator();
  
  // Act
  const result = calculator.add(2, 2);
  
  // Assert
  expect(result).toBe(4);
});
```

### Testing Edge Cases
```javascript
test('handles edge cases', () => {
  const values = [0, -1, null, undefined, NaN];
  values.forEach(value => {
    expect(handleValue(value)).toBeDefined();
  });
});
```

## 10. Tips and Tricks

### Snapshot Testing
```javascript
test('matches snapshot', () => {
  const tree = render(<Component />);
  expect(tree).toMatchSnapshot();
});
```

### Custom Matchers
```javascript
expect.extend({
  toBeValidGrade(received) {
    const validGrades = ['A', 'B', 'C', 'D', 'F'];
    return {
      pass: validGrades.includes(received),
      message: () => `Expected ${received} to be a valid grade`
    };
  }
});

test('custom matcher', () => {
  expect('A').toBeValidGrade();
});
```

## Remember:
- Keep tests focused and specific
- Use descriptive test names
- Handle async operations properly
- Clean up after tests
- Mock external dependencies
- Test edge cases and error conditions
- Use appropriate assertions
- Maintain test independence
