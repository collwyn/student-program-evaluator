const fs = require('fs');
const path = require('path');

console.log('Analyzing test coverage and generating report...\n');

// Helper function to format percentages
function formatPercentage(number) {
    return `${(number * 100).toFixed(2)}%`;
}

// Helper function to create visual bar
function createBar(percentage, length = 30) {
    const filled = Math.round(length * percentage);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

// Helper function to format status
function getStatus(percentage) {
    if (percentage >= 0.8) return '✅ Good';
    if (percentage >= 0.6) return '⚠️ Needs Improvement';
    return '❌ Poor';
}

// Check if coverage directory exists
if (!fs.existsSync('coverage/lcov-report')) {
    console.log('❌ No coverage report found. Please run tests with coverage first:');
    console.log('npm run test:coverage');
    process.exit(1);
}

// Read coverage data
try {
    const coverageSummary = JSON.parse(
        fs.readFileSync('coverage/coverage-summary.json', 'utf8')
    );

    console.log('📊 Test Coverage Analysis\n');
    console.log('Overall Coverage Summary:');
    console.log('------------------------');

    const total = coverageSummary.total;
    const metrics = {
        statements: total.statements.pct / 100,
        branches: total.branches.pct / 100,
        functions: total.functions.pct / 100,
        lines: total.lines.pct / 100
    };

    // Display overall metrics
    Object.entries(metrics).forEach(([metric, value]) => {
        console.log(`\n${metric.charAt(0).toUpperCase() + metric.slice(1)}:`);
        console.log(`${createBar(value)} ${formatPercentage(value)} ${getStatus(value)}`);
    });

    // Analyze individual components
    console.log('\n\nComponent Analysis:');
    console.log('------------------');

    const components = Object.entries(coverageSummary)
        .filter(([key]) => key !== 'total')
        .map(([file, coverage]) => ({
            file: path.basename(file),
            coverage: coverage.statements.pct / 100
        }))
        .sort((a, b) => b.coverage - a.coverage);

    components.forEach(({ file, coverage }) => {
        console.log(`\n${file}:`);
        console.log(`${createBar(coverage)} ${formatPercentage(coverage)} ${getStatus(coverage)}`);
    });

    // Generate recommendations
    console.log('\n\n📝 Recommendations:');
    console.log('------------------');

    const lowCoverageComponents = components
        .filter(({ coverage }) => coverage < 0.8)
        .map(({ file }) => file);

    if (lowCoverageComponents.length > 0) {
        console.log('\n❗ Components needing more test coverage:');
        lowCoverageComponents.forEach(file => {
            console.log(`- ${file}`);
        });
    }

    if (metrics.branches < 0.8) {
        console.log('\n⚠️ Branch Coverage Improvements Needed:');
        console.log('- Add tests for edge cases and error conditions');
        console.log('- Ensure all conditional paths are tested');
    }

    if (metrics.functions < 0.8) {
        console.log('\n⚠️ Function Coverage Improvements Needed:');
        console.log('- Add tests for untested functions');
        console.log('- Ensure utility functions are properly tested');
    }

    // Save report to file
    const reportDate = new Date().toISOString().split('T')[0];
    const reportContent = `
Test Coverage Report (${reportDate})
===================================

Overall Coverage:
----------------
Statements: ${formatPercentage(metrics.statements)}
Branches:   ${formatPercentage(metrics.branches)}
Functions:  ${formatPercentage(metrics.functions)}
Lines:      ${formatPercentage(metrics.lines)}

Component Coverage:
-----------------
${components.map(({ file, coverage }) => 
    `${file}: ${formatPercentage(coverage)}`
).join('\n')}

Recommendations:
--------------
${lowCoverageComponents.length > 0 ? 
    `Components needing improvement:\n${lowCoverageComponents.map(file => `- ${file}`).join('\n')}` : 
    'All components have good coverage.'}

Next Steps:
----------
1. Focus on components with coverage below 80%
2. Add tests for uncovered edge cases
3. Improve documentation for complex test cases
4. Regular test maintenance and updates
`;

    fs.writeFileSync(`test-results/coverage-report-${reportDate}.txt`, reportContent);
    console.log(`\n✅ Report saved to: test-results/coverage-report-${reportDate}.txt`);

    // Final summary
    const averageCoverage = Object.values(metrics).reduce((a, b) => a + b, 0) / 4;
    console.log('\n📈 Overall Status:', getStatus(averageCoverage));
    console.log(`Average Coverage: ${formatPercentage(averageCoverage)}`);

    if (averageCoverage < 0.8) {
        console.log('\n⚠️ Action needed: Improve test coverage to reach at least 80%');
    } else {
        console.log('\n✨ Great job! Maintain the good coverage level');
    }

} catch (error) {
    console.error('❌ Error analyzing coverage:', error.message);
    console.log('Please ensure you have run the tests with coverage enabled.');
    process.exit(1);
}

console.log('\nPress any key to exit...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
