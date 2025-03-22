import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import FinancialReports from '../FinancialReports';
import ReportFilters from '../ReportFilters';
import ReportChart from '../ReportChart';

// Mock the required components and dependencies
jest.mock('axios');
jest.mock('../ReportFilters', () => jest.fn(() => <div data-testid="report-filters" />));
jest.mock('../ReportChart', () => jest.fn(() => <div data-testid="report-chart" />));
jest.mock('../UserHeader', () => jest.fn(() => <div data-testid="user-header" />));
jest.mock('../UserFooter', () => jest.fn(() => <div data-testid="user-footer" />));

describe('FinancialReports Component', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.Q2ck2zCG8yj7ykDMqIxdMVt4OQqPjRKFznKy_iu3h7A';
  const mockTransactions = [
    { id: 1, category: 'Food', type: 'expense', amount: 50, tags: [{ name: 'Groceries' }] },
    { id: 2, category: 'Salary', type: 'income', amount: 1000, tags: [{ name: 'Work' }] },
    { id: 3, category: 'Food', type: 'expense', amount: 30, tags: [{ name: 'Restaurant' }] },
    { id: 4, category: 'Entertainment', type: 'expense', amount: 20, tags: [{ name: 'Movies' }] }
  ];

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => mockToken),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });

    // Mock axios response
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders financial reports component with header and footer', async () => {
    render(<FinancialReports />);
    
    expect(screen.getByTestId('user-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-footer')).toBeInTheDocument();
    expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    expect(screen.getByTestId('report-filters')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('report-chart')).toBeInTheDocument();
    });
  });

  test('fetches transactions on component mount', async () => {
    render(<FinancialReports />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/transactions/', {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
    });
  });

  test('displays aggregated transaction data correctly', async () => {
    render(<FinancialReports />);
    
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
      
      // Check for the correct amounts
      expect(screen.getByText('Income: $0')).toBeInTheDocument(); // For Food
      expect(screen.getByText('Expenses: $80')).toBeInTheDocument(); // For Food
      expect(screen.getByText('Net: $-80')).toBeInTheDocument(); // For Food
      
      expect(screen.getByText('Income: $1000')).toBeInTheDocument(); // For Salary
      expect(screen.getByText('Expenses: $0')).toBeInTheDocument(); // For Salary
      expect(screen.getByText('Net: $1000')).toBeInTheDocument(); // For Salary
    });
  });

  test('filters transactions based on category', async () => {
    // Mock the filter change
    ReportFilters.mockImplementation(({ onFilterChange }) => {
      React.useEffect(() => {
        onFilterChange({ timePeriod: 'monthly', category: 'Food', tag: '' });
      }, [onFilterChange]);
      return <div data-testid="report-filters" />;
    });
    
    render(<FinancialReports />);
    
    await waitFor(() => {
      // Should only show Food category
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.queryByText('Salary')).not.toBeInTheDocument();
      expect(screen.queryByText('Entertainment')).not.toBeInTheDocument();
    });
  });

  test('filters transactions based on tag', async () => {
    // Mock the filter change
    ReportFilters.mockImplementation(({ onFilterChange }) => {
      React.useEffect(() => {
        onFilterChange({ timePeriod: 'monthly', category: '', tag: 'Groceries' });
      }, [onFilterChange]);
      return <div data-testid="report-filters" />;
    });
    
    render(<FinancialReports />);
    
    await waitFor(() => {
      // Should only show transactions with Groceries tag (only Food category with $50)
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Expenses: $50')).toBeInTheDocument();
      expect(screen.queryByText('Salary')).not.toBeInTheDocument();
      expect(screen.queryByText('Entertainment')).not.toBeInTheDocument();
    });
  });

  test('passes correct chart data to ReportChart', async () => {
    render(<FinancialReports />);
    
    await waitFor(() => {
      const expectedChartData = {
        labels: ['Food', 'Salary', 'Entertainment'],
        datasets: [
          {
            label: 'Income',
            data: [0, 1000, 0],
            backgroundColor: '#4ECDC4',
          },
          {
            label: 'Expenses',
            data: [80, 0, 20],
            backgroundColor: '#FF6B6B',
          },
        ],
      };
      
      expect(ReportChart).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            labels: expectedChartData.labels,
            datasets: expect.arrayContaining([
              expect.objectContaining({
                label: 'Income',
                backgroundColor: '#4ECDC4',
              }),
              expect.objectContaining({
                label: 'Expenses',
                backgroundColor: '#FF6B6B',
              }),
            ]),
          }),
        }),
        expect.anything()
      );
    });
  });

  test('handles API error gracefully', async () => {
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock API failure
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<FinancialReports />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
