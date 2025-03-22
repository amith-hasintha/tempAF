import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TransactionItem from '../TransactionItem';

// Mock the modules
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TransactionItem Component', () => {
  const mockNavigate = jest.fn();
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const mockTransactions = [
    { _id: '1', amount: 100, category: 'food', description: 'Groceries' },
    { _id: '2', amount: 50, category: 'transport', description: 'Gas' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.getItem.mockReturnValue(mockToken);
    
    // Mock the atob function
    global.atob = jest.fn(() => JSON.stringify({ id: '1234567890' }));
    
    // Mock successful API response
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  test('renders transaction list correctly', async () => {
    render(<TransactionItem />);
    
    // Check if the component renders the header
    expect(screen.getByText('Your Transactions')).toBeInTheDocument();
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('transport - $50')).toBeInTheDocument();
      expect(screen.getByText('Gas')).toBeInTheDocument();
    });
  });

  test('displays "No transactions found" when no transactions exist', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  test('handles API error when fetching transactions', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('navigates to add transaction page when button is clicked', () => {
    render(<TransactionItem />);
    
    const addButton = screen.getByText('+ Add Transaction');
    fireEvent.click(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/add-transaction');
  });

  test('deletes a transaction when delete button is clicked', async () => {
    axios.delete.mockResolvedValueOnce({});
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:5000/api/transactions/1',
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    
    // After deletion, only the second transaction should remain
    await waitFor(() => {
      expect(screen.queryByText('food - $100')).not.toBeInTheDocument();
      expect(screen.getByText('transport - $50')).toBeInTheDocument();
    });
  });

  test('enters edit mode when edit button is clicked', async () => {
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if edit form is displayed
    const amountInput = screen.getByDisplayValue('100');
    const categorySelect = screen.getByDisplayValue('food');
    const descriptionInput = screen.getByDisplayValue('Groceries');
    
    expect(amountInput).toBeInTheDocument();
    expect(categorySelect).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('updates a transaction when save button is clicked', async () => {
    const updatedTransaction = { 
      _id: '1', 
      amount: 150, 
      category: 'entertainment', 
      description: 'Movie night' 
    };
    
    axios.put.mockResolvedValueOnce({ 
      data: { transaction: updatedTransaction } 
    });
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
    });
    
    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update form fields
    const amountInput = screen.getByDisplayValue('100');
    const categorySelect = screen.getByDisplayValue('food');
    const descriptionInput = screen.getByDisplayValue('Groceries');
    
    fireEvent.change(amountInput, { target: { value: '150' } });
    fireEvent.change(categorySelect, { target: { value: 'entertainment' } });
    fireEvent.change(descriptionInput, { target: { value: 'Movie night' } });
    
    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:5000/api/transactions/1',
      { amount: '150', category: 'entertainment', description: 'Movie night' },
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    
    // Check if transaction was updated
    await waitFor(() => {
      expect(screen.getByText('entertainment - $150')).toBeInTheDocument();
      expect(screen.getByText('Movie night')).toBeInTheDocument();
    });
  });

  test('cancels edit mode when cancel button is clicked', async () => {
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
    });
    
    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Cancel edit
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if we're back to view mode
    expect(screen.getByText('food - $100')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  test('handles error when no token is available', async () => {
    localStorage.getItem.mockReturnValueOnce(null);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('No token found. Please log in.');
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles API error when updating transaction', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.put.mockRejectedValueOnce(new Error('Update failed'));
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
    });
    
    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Try to save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles API error when deleting transaction', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.delete.mockRejectedValueOnce(new Error('Delete failed'));
    
    render(<TransactionItem />);
    
    await waitFor(() => {
      expect(screen.getByText('food - $100')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });
});
