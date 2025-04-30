import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProgramAnalytics from '../ProgramAnalytics';
import { Chart as ChartJS } from 'chart.js';

// Mock Chart.js to avoid canvas rendering issues
jest.mock('chart.js');

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock data
const mockAnalyticsData = {
  effectivenessTrend: [
    { date: '2023-01-01', score: 85 },
    { date: '2023-02-01', score: 87 },
    { date: '2023-03-01', score: 90 }
  ],
  distribution: {
    excellent: 10,
    good: 15,
    average: 8,
    needsImprovement: 3
  },
  metrics: {
    studentPerformance: 88,
    attendance: 92,
    satisfaction: 85,
    completionRate: 95,
    resourceUtilization: 87
  },
  recommendations: [
    {
      type: 'improvement',
      priority: 'high',
      description: 'Consider implementing additional support for struggling students',
      specificActions: [
        'Schedule extra tutoring sessions',
        'Provide supplementary materials'
      ]
    }
  ]
};

describe('ProgramAnalytics', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch.mockReset();
    
    // Mock successful API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockAnalyticsData })
    });
  });

  it('renders loading state initially', () => {
    render(<ProgramAnalytics programId="test-program" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders analytics data after loading', async () => {
    render(<ProgramAnalytics programId="test-program" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if main components are rendered
    expect(screen.getByText('Program Analytics')).toBeInTheDocument();
    expect(screen.getByText('Effectiveness Trend')).toBeInTheDocument();
    expect(screen.getByText('Performance Distribution')).toBeInTheDocument();
    expect(screen.getByText('Program Metrics')).toBeInTheDocument();
  });

  it('handles timeframe selection', async () => {
    render(<ProgramAnalytics programId="test-program" />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Change timeframe
    const timeframeSelect = screen.getByLabelText(/timeframe/i);
    await userEvent.selectOptions(timeframeSelect, '3months');

    // Verify new API call was made with correct timeframe
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('timeframe=3months'),
      expect.any(Object)
    );
  });

  it('displays error state on API failure', async () => {
    // Mock API error
    global.fetch.mockRejectedValue(new Error('API Error'));

    render(<ProgramAnalytics programId="test-program" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('renders effectiveness trend chart correctly', async () => {
    render(<ProgramAnalytics programId="test-program" />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify chart container exists
    expect(screen.getByTestId('effectiveness-trend-chart')).toBeInTheDocument();

    // Verify chart was initialized with correct data
    expect(ChartJS.register).toHaveBeenCalled();
  });

  it('renders performance distribution chart correctly', async () => {
    render(<ProgramAnalytics programId="test-program" />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify chart container exists
    expect(screen.getByTestId('performance-distribution-chart')).toBeInTheDocument();

    // Check if distribution categories are displayed
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('displays AI recommendations correctly', async () => {
    render(<ProgramAnalytics programId="test-program" />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if recommendations are displayed
    expect(screen.getByText(/implementing additional support/i)).toBeInTheDocument();
    
    // Verify specific actions are listed
    mockAnalyticsData.recommendations[0].specificActions.forEach(action => {
      expect(screen.getByText(action)).toBeInTheDocument();
    });
  });

  it('handles empty analytics data gracefully', async () => {
    // Mock empty response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          effectivenessTrend: [],
          distribution: {
            excellent: 0,
            good: 0,
            average: 0,
            needsImprovement: 0
          },
          metrics: {},
          recommendations: []
        }
      })
    });

    render(<ProgramAnalytics programId="test-program" />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check for "no data" messages
    expect(screen.getByText(/no trend data available/i)).toBeInTheDocument();
    expect(screen.getByText(/no distribution data available/i)).toBeInTheDocument();
  });

  it('updates charts when new data is received', async () => {
    const { rerender } = render(<ProgramAnalytics programId="test-program" />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Mock new data
    const newData = {
      ...mockAnalyticsData,
      effectivenessTrend: [
        ...mockAnalyticsData.effectivenessTrend,
        { date: '2023-04-01', score: 92 }
      ]
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: newData })
    });

    // Trigger re-render with new program ID
    rerender(<ProgramAnalytics programId="new-program" />);

    await waitFor(() => {
      // Verify new API call was made
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('new-program'),
        expect.any(Object)
      );
    });
  });
});
