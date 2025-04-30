#!/bin/bash

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Clear the terminal
clear

print_header "Test Runner Script"
echo "This script will guide you through running the test suite"

# Check if Node.js is installed
print_header "Checking Prerequisites"
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi
print_success "Node.js is installed ($(node -v))"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm is installed ($(npm -v))"

# Setup environment
print_header "Setting Up Test Environment"
echo "Running environment setup script..."
node setup-test-environment.js
if [ $? -ne 0 ]; then
    print_error "Environment setup failed"
    exit 1
fi
print_success "Environment setup complete"

# Install dependencies if needed
print_header "Checking Dependencies"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
fi
print_success "Dependencies are installed"

# Run different types of tests
print_header "Running Tests"

# Ask user what type of tests to run
echo -e "What type of tests would you like to run?\n"
echo "1. All tests"
echo "2. Backend tests only"
echo "3. Frontend tests only"
echo "4. Example test only"
echo "5. Coverage report"
echo -e "\nEnter your choice (1-5):"
read -r choice

case $choice in
    1)
        print_header "Running All Tests"
        npm test
        ;;
    2)
        print_header "Running Backend Tests"
        npm run test:server
        ;;
    3)
        print_header "Running Frontend Tests"
        npm run test:client
        ;;
    4)
        print_header "Running Example Test"
        npx jest examples/FirstTest.test.js --verbose
        ;;
    5)
        print_header "Generating Coverage Report"
        npm run test:coverage
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Check if tests passed
if [ $? -ne 0 ]; then
    print_error "Some tests failed"
    echo -e "\nPlease check the test output above for details"
    echo "For troubleshooting help, refer to TESTING_TROUBLESHOOTING.md"
else
    print_success "All tests passed"
fi

# Run coverage analysis if coverage report was generated
if [ $choice -eq 5 ]; then
    print_header "Analyzing Test Coverage"
    node analyze-test-coverage.js
fi

# Final summary
print_header "Test Execution Complete"
echo "For more information:"
echo "- Read TESTING_GUIDE.md for detailed testing documentation"
echo "- Check TESTING_TROUBLESHOOTING.md if you encountered any issues"
echo "- Review test results in the coverage directory"

# Cleanup
print_header "Cleanup"
echo "Removing temporary test files..."
find . -name "*.test.log" -type f -delete
find . -name "*.tmp" -type f -delete
print_success "Cleanup complete"

print_header "Next Steps"
echo "1. Review test results above"
echo "2. Check coverage reports in coverage/"
echo "3. Fix any failing tests"
echo "4. Add more tests for uncovered code"

echo -e "\nPress Enter to exit..."
read -r
