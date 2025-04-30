# Visual Studio Code Testing Guide

## Setup

1. Install recommended VS Code extensions:
   - Jest Runner (orta.vscode-jest)
   - ESLint (dbaeumer.vscode-eslint)
   - Prettier (esbenp.prettier-vscode)
   - Test Explorer UI (hbenl.vscode-test-explorer)

2. The provided `.vscode/settings.json` file configures your workspace for testing
3. Test snippets are available in `.vscode/test-snippets.code-snippets`

## Using Test Snippets

### Available Snippets

Type these prefixes in a test file to trigger snippets:

| Prefix      | Description                    | Example Usage                        |
|-------------|--------------------------------|-------------------------------------|
| `test`      | Basic test case               | Creates a simple test with AAA pattern |
| `testa`     | Async test case               | Creates an async test with await     |
| `desc`      | Describe block                | Creates a test suite with setup      |
| `testc`     | React component test          | Creates a component test suite       |
| `mockfn`    | Mock function                 | Creates a Jest mock function         |
| `testapi`   | API test                      | Creates an API test with fetch mock  |
| `testerr`   | Error test                    | Creates an error handling test       |
| `testerra`  | Async error test              | Creates an async error test          |
| `testsetup` | Test setup blocks             | Creates before/after hooks           |
| `mockmodule`| Module mock                   | Creates a Jest module mock           |
| `testsnap`  | Snapshot test                 | Creates a snapshot test              |

### Example Usage

1. Create a new test file:
   ```javascript
   // Component.test.jsx
   <type 'testc' and press Tab>
   ```

2. Write a basic test:
   ```javascript
   <type 'test' and press Tab>
   // Fill in the placeholders that appear
   ```

3. Add async test:
   ```javascript
   <type 'testa' and press Tab>
   // Fill in the async function details
   ```

## VS Code Features

### Test Explorer

1. Open Test Explorer:
   - Click the test tube icon in the sidebar
   - Or use `Ctrl+Shift+P` and type "Test Explorer"

2. Run tests:
   - Click play button next to tests
   - Right-click for more options
   - Use CodeLens links above tests

### Debug Tests

1. Set breakpoints:
   - Click in the gutter next to line numbers
   - Or press F9 on the line

2. Debug test:
   - Click debug icon in Test Explorer
   - Or use CodeLens "Debug Test" link

### Coverage

1. View coverage:
   - Run tests with coverage (`npm run test:coverage`)
   - Coverage highlights appear in editor
   - View detailed report in coverage/lcov-report/index.html

## Keyboard Shortcuts

| Action                    | Windows/Linux           | Mac                    |
|--------------------------|-------------------------|------------------------|
| Run test at cursor       | `Alt+Shift+T`          | `Cmd+Shift+T`         |
| Debug test at cursor     | `Alt+Shift+D`          | `Cmd+Shift+D`         |
| Show Test Explorer       | `Ctrl+Shift+P` (then type "Test Explorer") | `Cmd+Shift+P` |
| Toggle line breakpoint   | `F9`                   | `F9`                  |
| Start debugging         | `F5`                   | `F5`                  |
| Step over               | `F10`                  | `F10`                 |
| Step into               | `F11`                  | `F11`                 |
| Stop debugging         | `Shift+F5`             | `Shift+F5`            |

## Best Practices

1. File Organization:
   - Keep test files next to source files
   - Use `.test.js` or `.spec.js` extensions
   - Group related tests in describe blocks

2. Test Structure:
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Keep tests focused and simple

3. Using Snippets Effectively:
   - Start with `desc` for test suites
   - Use `test` for simple cases
   - Use `testa` for async operations
   - Use `testc` for React components

4. Debugging Tips:
   - Use console.log with test:
     ```javascript
     test('debug example', () => {
       console.log('Debug output');
       // Test code
     });
     ```
   - Use debugger statement:
     ```javascript
     test('debug with breakpoint', () => {
       debugger;
       // Test code
     });
     ```

## Common Issues

1. Tests not running:
   - Check file naming (.test.js or .spec.js)
   - Verify Jest configuration
   - Check test path matches pattern

2. Snippets not working:
   - Ensure file type is JavaScript/React
   - Check extension is installed
   - Reload VS Code if needed

3. Coverage not showing:
   - Run with coverage flag
   - Check coverage configuration
   - Reload VS Code

4. Debug not working:
   - Check launch configuration
   - Verify breakpoints are bound
   - Check source maps are enabled

## Additional Resources

1. Documentation:
   - Jest documentation: https://jestjs.io/docs/getting-started
   - React Testing Library: https://testing-library.com/docs/react-testing-library/intro
   - VS Code Testing: https://code.visualstudio.com/docs/nodejs/nodejs-testing

2. Helpful Commands:
   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npm test -- path/to/test.js

   # Run tests with coverage
   npm run test:coverage

   # Run tests in watch mode
   npm run test:watch
   ```

Remember: The provided snippets and settings are designed to make testing easier. Use them to maintain consistent testing patterns across your codebase.
