module.exports = {
  // Basic Jest configuration
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000,

  // Test file patterns
  testMatch: [
    "**/test/**/*.test.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/test/**",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Setup and teardown files
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],

  // Module name mapping for aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  // Environment variables for testing
  setupFiles: ["<rootDir>/src/test/setEnvVars.js"],

  // Global configuration
  globals: {
    NODE_ENV: "test"
  },

  // Reporter configuration
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-results/jest",
        outputName: "results.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: true
      }
    ]
  ],

  // Mocking configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // Test execution configuration
  maxWorkers: "50%",
  bail: false,
  detectOpenHandles: true,
  forceExit: true,

  // Custom resolver for module imports
  resolver: undefined,

  // Transform configuration
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "\\.pnp\\.[^\\/]+$"
  ],

  // Module file extensions
  moduleFileExtensions: [
    "js",
    "json",
    "node"
  ],

  // Specific directories to search for modules
  roots: [
    "<rootDir>/src"
  ],

  // Watch configuration
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ],

  // Error handling
  errorOnDeprecated: true,

  // Test sequencing
  randomize: true,
  
  // Snapshot configuration
  snapshotSerializers: [],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: false
  }
};
