import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';

// Mock Stripe promise for testing
const mockStripePromise = Promise.resolve({
  elements: () => ({
    create: jest.fn(),
    getElement: jest.fn()
  }),
  confirmPayment: jest.fn(),
  confirmCardPayment: jest.fn()
});

// Custom render function with common providers
export const renderWithProviders = (ui, { route = '/', initialState = {} } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Elements stripe={mockStripePromise}>
        {ui}
      </Elements>
    </MemoryRouter>
  );
};

// Common test data generators
export const generateTestData = {
  student: (overrides = {}) => ({
    _id: 'test-student-id',
    personalInfo: {
      firstName: 'Test',
      lastName: 'Student',
      email: 'test@example.com',
      studentId: 'STU123'
    },
    academicProfile: {
      grade: '10',
      status: 'active',
      performanceMetrics: {
        overallGPA: 3.5,
        attendanceRate: 95,
        participationScore: 85
      }
    },
    ...overrides
  }),

  program: (overrides = {}) => ({
    _id: 'test-program-id',
    name: 'Test Program',
    description: 'Test Description',
    type: 'academic',
    metrics: {
      effectivenessScore: 85,
      studentSatisfaction: 4.2,
      averagePerformance: 88,
      completionRate: 92
    },
    ...overrides
  }),

  assessment: (overrides = {}) => ({
    _id: 'test-assessment-id',
    type: 'exam',
    name: 'Test Assessment',
    score: 85,
    maxScore: 100,
    date: new Date().toISOString(),
    feedback: 'Good work',
    ...overrides
  }),

  attendance: (overrides = {}) => ({
    _id: 'test-attendance-id',
    date: new Date().toISOString(),
    status: 'present',
    ...overrides
  })
};

// Mock API response helpers
export const mockApiResponse = {
  success: (data) => ({
    ok: true,
    json: () => Promise.resolve({ success: true, data })
  }),

  error: (message) => ({
    ok: false,
    json: () => Promise.resolve({ success: false, error: message })
  }),

  networkError: () => Promise.reject(new Error('Network error'))
};

// Mock chart data helpers
export const mockChartData = {
  performance: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Performance',
        data: [75, 80, 85, 82, 88],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  },

  attendance: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [90, 95, 85, 100],
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }
    ]
  }
};

// Common test event helpers
export const mockEvents = {
  click: {
    button: (element) => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    }
  },
  
  change: {
    input: (element, value) => {
      const event = new Event('change', {
        bubbles: true,
        cancelable: true
      });
      element.value = value;
      element.dispatchEvent(event);
    }
  }
};

// Mock window methods
export const mockWindow = {
  scrollTo: jest.fn(),
  location: {
    assign: jest.fn(),
    replace: jest.fn()
  },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  }
};

// Cleanup utility
export const cleanup = () => {
  jest.clearAllMocks();
  localStorage.clear();
};

export default {
  renderWithProviders,
  generateTestData,
  mockApiResponse,
  mockChartData,
  mockEvents,
  mockWindow,
  cleanup
};
