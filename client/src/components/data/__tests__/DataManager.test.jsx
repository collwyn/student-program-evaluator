import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DataManager from '../DataManager';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('DataManager', () => {
  // Mock FormData
  const mockFormData = {
    append: jest.fn()
  };
  global.FormData = jest.fn(() => mockFormData);

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  describe('Import functionality', () => {
    it('renders import section with file input', () => {
      render(<DataManager />);
      
      expect(screen.getByText('Import Data')).toBeInTheDocument();
      expect(screen.getByLabelText(/select csv file/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /import data/i })).toBeInTheDocument();
    });

    it('handles file selection', async () => {
      render(<DataManager />);

      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select csv file/i);

      await userEvent.upload(fileInput, file);

      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    it('validates file type', async () => {
      render(<DataManager />);

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/select csv file/i);

      await userEvent.upload(fileInput, file);

      expect(screen.getByText(/please select a csv file/i)).toBeInTheDocument();
    });

    it('handles successful import', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imported: 10,
            errors: []
          }
        })
      });

      render(<DataManager />);

      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select csv file/i);
      await userEvent.upload(fileInput, file);

      const importButton = screen.getByRole('button', { name: /import data/i });
      await userEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully imported 10 records/i)).toBeInTheDocument();
      });
    });

    it('handles import with errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imported: 8,
            errors: [
              { row: 2, error: 'Missing required field' }
            ]
          }
        })
      });

      render(<DataManager />);

      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select csv file/i);
      await userEvent.upload(fileInput, file);

      const importButton = screen.getByRole('button', { name: /import data/i });
      await userEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/import completed with 1 errors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export functionality', () => {
    it('renders export section with options', () => {
      render(<DataManager />);
      
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByLabelText(/export type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export format/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
    });

    it('handles successful export', async () => {
      // Mock successful blob response
      const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      // Mock URL.createObjectURL
      const mockUrl = 'blob:test-url';
      global.URL.createObjectURL = jest.fn(() => mockUrl);
      global.URL.revokeObjectURL = jest.fn();

      render(<DataManager />);

      // Select export type and format
      const typeSelect = screen.getByLabelText(/export type/i);
      const formatSelect = screen.getByLabelText(/export format/i);
      
      await userEvent.selectOptions(typeSelect, 'students');
      await userEvent.selectOptions(formatSelect, 'csv');

      // Click export button
      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/export completed successfully/i)).toBeInTheDocument();
      });

      // Verify URL handling
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('handles export error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Export failed'));

      render(<DataManager />);

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });

    it('disables export button during export', async () => {
      // Mock slow response
      global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<DataManager />);

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      expect(exportButton).toBeDisabled();
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('displays error message on API failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<DataManager />);

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/api error/i)).toBeInTheDocument();
      });
    });

    it('allows dismissing error messages', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<DataManager />);

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        const closeButton = within(alert).getByRole('button');
        userEvent.click(closeButton);
        expect(alert).not.toBeInTheDocument();
      });
    });
  });

  describe('Form validation', () => {
    it('requires file selection for import', async () => {
      render(<DataManager />);

      const importButton = screen.getByRole('button', { name: /import data/i });
      await userEvent.click(importButton);

      expect(screen.getByText(/please select a file to import/i)).toBeInTheDocument();
    });

    it('validates export type selection', async () => {
      render(<DataManager />);

      // Clear export type selection
      const typeSelect = screen.getByLabelText(/export type/i);
      await userEvent.selectOptions(typeSelect, '');

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      expect(screen.getByText(/please select an export type/i)).toBeInTheDocument();
    });
  });
});
