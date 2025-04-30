// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { configure } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

// Enable fake timers
jest.useFakeTimers();

// Mock fetch globally
fetchMock.enableMocks();

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 1000,
  throwSuggestions: true,
  defaultHidden: true
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserverMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  RadialLinearScale: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    elements: jest.fn(() => ({
      create: jest.fn(),
    })),
    confirmPayment: jest.fn(),
    confirmCardPayment: jest.fn(),
  })),
}));

// Mock local storage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Custom test helpers
global.testHelpers = {
  mockAuthToken: 'mock-auth-token',

  mockAuthenticatedResponse: (data) => ({
    ok: true,
    json: async () => ({ success: true, data }),
  }),

  mockErrorResponse: (message) => ({
    ok: false,
    json: async () => ({ success: false, error: message }),
  }),

  createMockFile: (name = 'test.csv', type = 'text/csv', content = 'test,data') => 
    new File([content], name, { type }),

  createMockChart: () => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      datasets: [],
    },
  }),

  createMockStudent: (overrides = {}) => ({
    _id: 'student-1',
    personalInfo: {
      firstName: 'Test',
      lastName: 'Student',
      email: 'test@example.com',
      studentId: 'STU001'
    },
    academicProfile: {
      grade: '10',
      performanceMetrics: {
        overallGPA: 3.5,
        attendanceRate: 95
      }
    },
    ...overrides
  }),

  createMockProgram: (overrides = {}) => ({
    _id: 'program-1',
    name: 'Test Program',
    description: 'Test Description',
    type: 'academic',
    metrics: {
      effectivenessScore: 85,
      studentSatisfaction: 4.5
    },
    ...overrides
  })
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  fetchMock.resetMocks();
  localStorage.clear();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
