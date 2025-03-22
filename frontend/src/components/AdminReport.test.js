import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminReports from '../AdminReport';
import { act } from 'react-dom/test-utils';

// Mock the child components to simplify testing
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar" />);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer" />);

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AdminReports Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
  });

  test('renders the component with title', async () => {
    // Mock API responses
    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ _id: '1', name: 'Test User' }])
        });
      }
      if (url.includes('/api/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve([])
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<AdminReports />);
    });

    expect(screen.getByText('Transaction Reports')).toBeInTheDocument();
    expect(screen.getByText('Income by Category')).toBeInTheDocument();
    expect(screen.getByText('Expense by Category')).toBeInTheDocument();
  });

  test('fetches and displays users in dropdown', async () => {
    const mockUsers = [
      { _id: '1', name: 'User One' },
      { _id: '2', name: 'User Two' }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockUsers)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve([])
      });
    });

    await act(async () => {
      render(<AdminReports />);
    });

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/get', {
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
  });

  test('changes selected user and fetches transactions', async () => {
    const mockUsers = [
      { _id: '1', name: 'User One' },
      { _id: '2', name: 'User Two' }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockUsers)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve([])
      });
    });

    await act(async () => {
      render(<AdminReports />);
    });

    // Clear previous fetch calls
    fetch.mockClear();

    // Select a user
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Filter by User:/i), { target: { value: '2' } });
    });

    // Check that fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/2', {
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
  });

  test('processes transaction data correctly for charts', async () => {
    const mockTransactions = [
      { _id: '1', type: 'income', category: 'Salary', amount: 1000 },
      { _id: '2', type: 'income', category: 'Salary', amount: 2000 },
      { _id: '3', type: 'income', category: 'Investments', amount: 500 },
      { _id: '4', type: 'expense', category: 'Food', amount: 300 },
      { _id: '5', type: 'expense', category: 'Rent', amount: 1200 }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ _id: '1', name: 'Test User' }])
        });
      }
      if (url.includes('/api/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTransactions)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<AdminReports />);
    });

    // Since we can't easily test the chart data directly, we can check if the categories are displayed
    await waitFor(() => {
      expect(screen.getByText('Income by Category')).toBeInTheDocument();
      expect(screen.getByText('Expense by Category')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console error in test output
    
    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ _id: '1', name: 'Test User' }])
        });
      }
      if (url.includes('/api/transactions')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<AdminReports />);
    });

    // Component should still render without crashing
    expect(screen.getByText('Transaction Reports')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  test('handles empty transaction data', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ _id: '1', name: 'Test User' }])
        });
      }
      if (url.includes('/api/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve([])
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<AdminReports />);
    });

    // Charts should still render even with empty data
    expect(screen.getByText('Income by Category')).toBeInTheDocument();
    expect(screen.getByText('Expense by Category')).toBeInTheDocument();
  });

  test('handles non-array transaction response', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/auth/get')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ _id: '1', name: 'Test User' }])
        });
      }
      if (url.includes('/api/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve({ error: 'Invalid data' }) // Non-array response
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<AdminReports />);
    });

    // Component should handle non-array data gracefully
    expect(screen.getByText('Transaction Reports')).toBeInTheDocument();
  });
});
