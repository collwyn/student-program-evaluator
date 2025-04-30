const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up test environment...\n');

// Helper function to run commands and handle errors
function runCommand(command, errorMessage) {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`\n❌ Error: ${errorMessage}`);
        console.error(error.message);
        return false;
    }
}

// Check Node.js version
const nodeVersion = process.version;
console.log(`📌 Node.js version: ${nodeVersion}`);
if (nodeVersion.startsWith('v14') || nodeVersion.startsWith('v16') || nodeVersion.startsWith('v18')) {
    console.log('✅ Node.js version is compatible');
} else {
    console.log('❌ Please install Node.js version 14 or higher');
    process.exit(1);
}

// Check npm installation
try {
    const npmVersion = execSync('npm --version').toString().trim();
    console.log(`📌 npm version: ${npmVersion}`);
    console.log('✅ npm is installed');
} catch (error) {
    console.error('❌ npm is not installed');
    process.exit(1);
}

// Create necessary directories if they don't exist
const directories = [
    'examples',
    'coverage',
    'test-results'
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`📌 Directory exists: ${dir}`);
    }
});

// Install dependencies
console.log('\n📦 Installing dependencies...');
if (!runCommand('npm install', 'Failed to install dependencies')) {
    process.exit(1);
}

// Verify test files exist
const requiredFiles = [
    'examples/FirstTest.test.js',
    'FIRST_TEST_GUIDE.md',
    'TESTING_GUIDE.md',
    'TESTING_TROUBLESHOOTING.md'
];

console.log('\n🔍 Checking required files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ Found: ${file}`);
    } else {
        console.log(`❌ Missing: ${file}`);
        process.exit(1);
    }
});

// Create test environment variables file if it doesn't exist
const envFile = '.env.test';
if (!fs.existsSync(envFile)) {
    const envContent = `
NODE_ENV=test
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-evaluation-test
JWT_SECRET=test-secret-key
STRIPE_PUBLIC_KEY=pk_test_dummy
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
`;
    fs.writeFileSync(envFile, envContent.trim());
    console.log(`✅ Created ${envFile} file`);
} else {
    console.log(`📌 ${envFile} file exists`);
}

// Try running the example test
console.log('\n🧪 Running example test...');
if (!runCommand('npx jest examples/FirstTest.test.js --verbose', 'Failed to run example test')) {
    process.exit(1);
}

console.log('\n✨ Test environment setup complete! ✨');
console.log('\nNext steps:');
console.log('1. Read FIRST_TEST_GUIDE.md for detailed instructions');
console.log('2. Try modifying examples/FirstTest.test.js');
console.log('3. Run tests using: npm test');
console.log('\nHappy testing! 🚀');

// Add keyboard input to prevent immediate exit
console.log('\nPress any key to exit...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
