import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StudentDashboard from '../StudentDashboard';

// Mock chart components
jest.mock('../../charts/AttendanceChart', () => ({
  __esModule: true,
  default: () => <div data-testid="attendance-chart">Attendance Chart</div>
}));

jest.mock('../../charts/GradesTrend', () => ({
  __esModule: true,
  default: () => <div data-testid="grades-trend">Grades Trend</div>
}));

jest.mock('../../charts/ProgramProgress', () => ({
  __esModule: true,
  default: () => <div data-testid="program-progress">Program Progress</div>
}));

describe('StudentDashboard', () => {
  const mockStudent = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      studentId: 'STU001'
    },
    academicProfile: {
      performanceMetrics: {
        overallGPA: 3.8,
        attendanceRate: 95
      }
    }
  };

  const mockPerformance = {
    assessments: [
      { type: 'exam', score: 85, maxScore: 100 }
    ],
    attendance: [
      { status: 'present', date: '2023-10-15' }
    ],
    progressTracking: {
      overallProgress: 75
    }
  };

  beforeEach(() => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockStudent })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockPerformance })
      }));
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter initialEntries={['/students/STU001']}>
        <Routes>
          <Route path="/students/:studentId" element={<StudentDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    renderDashboard();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays student information after loading', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText('STU001')).toBeInTheDocument();
    });

    expect(screen.getByText('3.8')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('handles tab navigation', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    await userEvent.click(performanceTab);
    expect(performanceTab).toHaveAttribute('aria-selected', 'true');

    const attendanceTab = screen.getByRole('tab', { name: /attendance/i });
    await userEvent.click(attendanceTab);
    expect(attendanceTab).toHaveAttribute('aria-selected', 'true');
  });

  it('displays performance charts', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('grades-trend')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});
