@echo off
setlocal enabledelayedexpansion

:: Color codes
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "RED=[31m"
set "NC=[0m"

:: Function to print headers
:print_header
echo.
echo %BLUE%=== %~1 ===%NC%
echo.
goto :eof

:: Clear screen
cls

call :print_header "Test Runner Script"
echo This script will guide you through running the test suite

:: Check Prerequisites
call :print_header "Checking Prerequisites"

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ Node.js is not installed%NC%
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo %GREEN%✓ Node.js is installed%NC%

:: Check npm
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ npm is not installed%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ npm is installed%NC%

:: Setup environment
call :print_header "Setting Up Test Environment"
echo Running environment setup script...
node setup-test-environment.js
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ Environment setup failed%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ Environment setup complete%NC%

:: Check Dependencies
call :print_header "Checking Dependencies"
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%✗ Failed to install dependencies%NC%
        pause
        exit /b 1
    )
)
echo %GREEN%✓ Dependencies are installed%NC%

:: Test Menu
call :print_header "Running Tests"
echo What type of tests would you like to run?
echo.
echo 1. All tests
echo 2. Backend tests only
echo 3. Frontend tests only
echo 4. Example test only
echo 5. Coverage report
echo.
set /p choice="Enter your choice (1-5): "

:: Run selected tests
if "%choice%"=="1" (
    call :print_header "Running All Tests"
    call npm test
) else if "%choice%"=="2" (
    call :print_header "Running Backend Tests"
    call npm run test:server
) else if "%choice%"=="3" (
    call :print_header "Running Frontend Tests"
    call npm run test:client
) else if "%choice%"=="4" (
    call :print_header "Running Example Test"
    call npx jest examples/FirstTest.test.js --verbose
) else if "%choice%"=="5" (
    call :print_header "Generating Coverage Report"
    call npm run test:coverage
) else (
    echo %RED%✗ Invalid choice%NC%
    pause
    exit /b 1
)

:: Check test results
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ Some tests failed%NC%
    echo.
    echo Please check the test output above for details
    echo For troubleshooting help, refer to TESTING_TROUBLESHOOTING.md
) else (
    echo %GREEN%✓ All tests passed%NC%
)

:: Run coverage analysis if coverage report was generated
if "%choice%"=="5" (
    call :print_header "Analyzing Test Coverage"
    node analyze-test-coverage.js
)

:: Final summary
call :print_header "Test Execution Complete"
echo For more information:
echo - Read TESTING_GUIDE.md for detailed testing documentation
echo - Check TESTING_TROUBLESHOOTING.md if you encountered any issues
echo - Review test results in the coverage directory

:: Cleanup
call :print_header "Cleanup"
echo Removing temporary test files...
del /s /q *.test.log >nul 2>&1
del /s /q *.tmp >nul 2>&1
echo %GREEN%✓ Cleanup complete%NC%

call :print_header "Next Steps"
echo 1. Review test results above
echo 2. Check coverage reports in coverage/
echo 3. Fix any failing tests
echo 4. Add more tests for uncovered code

echo.
pause
exit /b 0
