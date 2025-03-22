import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ManageBudget from '../ManageBudget';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock components that aren't being tested
jest.mock('../UserHeader', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../UserFooter', () => () => <div data-testid="mock-footer">Footer</div>);

describe('ManageBudget Component', () => {
  const mockBudgets = [
    { _id: '1', category: 'Food', amount: 300, month: 'January', notifications: true },
    { _id: '2', category: 'Transport', amount: 150, month: 'February', notifications: false }
  ];
  
  const mockCategories = [
    { _id: '1', name: 'Food' },
    { _id: '2', name: 'Transport' },
    { _id: '3', name: 'Entertainment' }
  ];
  
  const mockNotifications = [
    { _id: '1', message: 'Budget alert', read: false, createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default axios responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/budgets')) {
        return Promise.resolve({ data: mockBudgets });
      } else if (url.includes('/api/categories')) {
        return Promise.resolve({ data: mockCategories });
      } else if (url.includes('/api/notifications')) {
        return Promise.resolve({ data: mockNotifications });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.post.mockResolvedValue({ data: { _id: '3', ...mockBudgets[0] } });
    axios.delete.mockResolvedValue({ data: { message: 'Budget deleted' } });
  });

  test('renders ManageBudget component with header and footer', async () => {
    render(<ManageBudget />);
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByText('Budget Management')).toBeInTheDocument();
  });

  test('fetches and displays budgets on load', async () => {
    render(<ManageBudget />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/budgets', 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Amount: $300')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
    });
  });

  test('fetches and displays categories in dropdown', async () => {
    render(<ManageBudget />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/categories', 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }));
    });
    
    // Open the dropdown to see options
    const categorySelect = screen.getByRole('combobox', { name: '' });
    fireEvent.click(categorySelect);
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Transport' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Entertainment' })).toBeInTheDocument();
    });
  });

  test('handles form input changes', async () => {
    render(<ManageBudget />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/categories', 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }));
    });
    
    // Select a category
    const categorySelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(categorySelect, { target: { value: 'Food', name: 'category' } });
    
    // Enter amount
    const amountInput = screen.getByPlaceholderText('Amount');
    fireEvent.change(amountInput, { target: { value: '500', name: 'amount' } });
    
    // Select a month
    const monthSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(monthSelect, { target: { value: 'March', name: 'month' } });
    
    // Toggle notifications
    const notificationsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(notificationsCheckbox);
    
    // Verify form state changes
    expect(categorySelect.value).toBe('Food');
    expect(amountInput.value).toBe('500');
    expect(monthSelect.value).toBe('March');
    expect(notificationsCheckbox.checked).toBe(false);
  });

  test('submits new budget successfully', async () => {
    render(<ManageBudget />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    
    // Fill out the form
    const categorySelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(categorySelect, { target: { value: 'Food', name: 'category' } });
    
    const amountInput = screen.getByPlaceholderText('Amount');
    fireEvent.change(amountInput, { target: { value: '500', name: 'amount' } });
    
    const monthSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(monthSelect, { target: { value: 'March', name: 'month' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Budget' });
    fireEvent.click(submitButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/budgets',
        { category: 'Food', amount: '500', month: 'March', notifications: true },
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } })
      );
    });
    
    // Verify budgets are refreshed
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/budgets', 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }));
    });
  });

  test('deletes a budget successfully', async () => {
    render(<ManageBudget />);
    
    // Wait for budgets to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    
    // Click delete button on first budget
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/budgets/1',
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } })
      );
    });
    
    // Verify budgets are refreshed
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/budgets', 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }));
    });
  });

  test('displays notifications', async () => {
    render(<ManageBudget />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/notifications', 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Budget alert')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Make the API call fail
    axios.get.mockRejectedValueOnce({ response: { data: 'Error fetching budgets' } });
    
    render(<ManageBudget />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching budgets:',
        'Error fetching budgets'
      );
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
