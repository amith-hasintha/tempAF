import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import TransactionList from '../TransactionList';

// Mock the axios module
jest.mock('axios');

// Mock the child components to simplify testing
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar" />);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer" />);

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('TransactionList Component', () => {
  const mockTransactions = [
    {
      _id: '1',
      user: 'user1',
      type: 'expense',
      amount: 50,
      category: 'food',
      description: 'Groceries',
      date: '2023-01-01T00:00:00.000Z',
    },
    {
      _id: '2',
      user: 'user2',
      type: 'income',
      amount: 1000,
      category: 'salary',
      description: 'Monthly salary',
      date: '2023-01-15T00:00:00.000Z',
    },
  ];

  const mockUsers = {
    user1: 'John Doe',
    user2: 'Jane Smith',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockReturnValue('fake-token');
  });

  test('renders the component with sidebar and footer', () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<TransactionList />);
    
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
    expect(screen.getByText('Admin - Manage Transactions')).toBeInTheDocument();
  });

  test('displays "No transactions found" when no transactions exist', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<TransactionList />);
    
    await waitFor(() => {
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  test('fetches and displays transactions', async () => {
    // Mock the transactions API call
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/transactions') {
        return Promise.resolve({ data: mockTransactions });
      } else if (url === 'http://localhost:5000/api/auth/user1') {
        return Promise.resolve({ data: { name: mockUsers.user1 } });
      } else if (url === 'http://localhost:5000/api/auth/user2') {
        return Promise.resolve({ data: { name: mockUsers.user2 } });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText(/\$50/)).toBeInTheDocument();
      expect(screen.getByText(/\$1000/)).toBeInTheDocument();
    });
  });

  test('handles transaction deletion', async () => {
    // Mock the API calls
    axios.get.mockResolvedValueOnce({ data: mockTransactions });
    mockTransactions.forEach(transaction => {
      axios.get.mockResolvedValueOnce({ 
        data: { name: mockUsers[transaction.user] } 
      });
    });
    axios.delete.mockResolvedValueOnce({});

    render(<TransactionList />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getAllByText(/Delete/).length).toBe(2);
    });

    // Click delete on the first transaction
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify axios.delete was called with the correct URL
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/1',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('opens edit form when Edit button is clicked', async () => {
    // Mock the API calls
    axios.get.mockResolvedValueOnce({ data: mockTransactions });
    mockTransactions.forEach(transaction => {
      axios.get.mockResolvedValueOnce({ 
        data: { name: mockUsers[transaction.user] } 
      });
    });

    render(<TransactionList />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getAllByText(/Edit/).length).toBe(2);
    });

    // Click edit on the first transaction
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Verify edit form is displayed
    await waitFor(() => {
      expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
      expect(screen.getByDisplayValue('expense')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
      expect(screen.getByDisplayValue('food')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Groceries')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument();
    });
  });

  test('updates form data when input values change', async () => {
    // Mock the API calls
    axios.get.mockResolvedValueOnce({ data: mockTransactions });
    mockTransactions.forEach(transaction => {
      axios.get.mockResolvedValueOnce({ 
        data: { name: mockUsers[transaction.user] } 
      });
    });

    render(<TransactionList />);

    // Wait for transactions to load and click edit
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    // Change amount value
    const amountInput = screen.getByDisplayValue('50');
    fireEvent.change(amountInput, { target: { value: '75' } });

    // Verify the input value was updated
    expect(screen.getByDisplayValue('75')).toBeInTheDocument();
  });

  test('submits updated transaction data', async () => {
    // Mock the API calls
    axios.get.mockResolvedValueOnce({ data: mockTransactions });
    mockTransactions.forEach(transaction => {
      axios.get.mockResolvedValueOnce({ 
        data: { name: mockUsers[transaction.user] } 
      });
    });
    
    axios.put.mockResolvedValueOnce({ 
      data: { 
        transaction: {
          ...mockTransactions[0],
          amount: 75,
        } 
      } 
    });

    render(<TransactionList />);

    // Wait for transactions to load and click edit
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    // Change amount value
    const amountInput = screen.getByDisplayValue('50');
    fireEvent.change(amountInput, { target: { value: '75' } });

    // Submit the form
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    // Verify axios.put was called with the correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/1',
        expect.objectContaining({
          amount: '75',
          type: 'expense',
          category: 'food',
          description: 'Groceries',
          date: '2023-01-01',
        }),
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('handles API error when fetching transactions', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Mock the API call to throw an error
    axios.get.mockRejectedValueOnce({ 
      response: { data: 'Error fetching transactions' } 
    });

    render(<TransactionList />);

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching transactions or users:',
        'Error fetching transactions'
      );
    });

    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles missing token', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Mock localStorage to return null for token
    localStorage.getItem.mockReturnValueOnce(null);

    render(<TransactionList />);

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'No token found. Please log in.'
      );
    });

    // Restore console.error
    console.error = originalConsoleError;
  });

  test('cancels editing when Cancel button is clicked', async () => {
    // Mock the API calls
    axios.get.mockResolvedValueOnce({ data: mockTransactions });
    mockTransactions.forEach(transaction => {
      axios.get.mockResolvedValueOnce({ 
        data: { name: mockUsers[transaction.user] } 
      });
    });

    render(<TransactionList />);

    // Wait for transactions to load and click edit
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    // Verify edit form is displayed
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Verify edit form is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Edit Transaction')).not.toBeInTheDocument();
    });
  });
});
