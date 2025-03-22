import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import TransactionForm from '../TransactionForm';

// Mock the UserHeader and UserFooter components
jest.mock('../UserHeader', () => () => <div data-testid="user-header">Header</div>);
jest.mock('../UserFooter', () => () => <div data-testid="user-footer">Footer</div>);

describe('TransactionForm Component', () => {
  let mockAxios;
  
  beforeEach(() => {
    // Setup axios mock
    mockAxios = new MockAdapter(axios);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock alert
    window.alert = jest.fn();
  });
  
  afterEach(() => {
    mockAxios.restore();
    jest.clearAllMocks();
  });
  
  test('renders the transaction form with initial values', () => {
    render(<TransactionForm />);
    
    // Check if the form title is rendered
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    
    // Check if form elements are rendered with default values
    expect(screen.getByLabelText(/Type/i)).toHaveValue('expense');
    expect(screen.getByLabelText(/Amount/i)).toHaveValue(null); // Empty number input
    expect(screen.getByLabelText(/Category/i)).toHaveValue('food');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByLabelText(/Tags/i)).toHaveValue('');
    
    // Check if the recurring checkbox is unchecked by default
    const recurringCheckbox = screen.getByLabelText(/Recurring Transaction/i);
    expect(recurringCheckbox).not.toBeChecked();
    
    // Recurrence fields should not be visible initially
    expect(screen.queryByLabelText(/Recurrence Pattern/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Recurrence End Date/i)).not.toBeInTheDocument();
    
    // Check if the submit button is rendered
    expect(screen.getByRole('button', { name: /Add Transaction/i })).toBeInTheDocument();
  });
  
  test('shows recurrence fields when recurring checkbox is checked', () => {
    render(<TransactionForm />);
    
    // Initially, recurrence fields should not be visible
    expect(screen.queryByLabelText(/Recurrence Pattern/i)).not.toBeInTheDocument();
    
    // Check the recurring checkbox
    const recurringCheckbox = screen.getByLabelText(/Recurring Transaction/i);
    fireEvent.click(recurringCheckbox);
    
    // Now recurrence fields should be visible
    expect(screen.getByLabelText(/Recurrence Pattern/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recurrence End Date/i)).toBeInTheDocument();
  });
  
  test('updates form values when inputs change', () => {
    render(<TransactionForm />);
    
    // Change type to income
    fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: 'income' } });
    expect(screen.getByLabelText(/Type/i)).toHaveValue('income');
    
    // Change amount
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
    expect(screen.getByLabelText(/Amount/i)).toHaveValue(100);
    
    // Change category
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'salary' } });
    expect(screen.getByLabelText(/Category/i)).toHaveValue('salary');
    
    // Change description
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Monthly salary' } });
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Monthly salary');
    
    // Change tags
    fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 'income,monthly,salary' } });
    expect(screen.getByLabelText(/Tags/i)).toHaveValue('income,monthly,salary');
  });
  
  test('submits the form with correct data', async () => {
    mockAxios.onPost('http://localhost:5000/api/transactions').reply(200, {});
    
    render(<TransactionForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Type/i), { target: { name: 'type', value: 'income' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { name: 'amount', value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { name: 'category', value: 'salary' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { name: 'description', value: 'Monthly salary' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(window.alert).toHaveBeenCalledWith('Transaction added successfully!');
    });
    
    // Check if the correct data was sent
    const sentData = JSON.parse(mockAxios.history.post[0].data);
    expect(sentData.type).toBe('income');
    expect(sentData.amount).toBe('1000');
    expect(sentData.category).toBe('salary');
    expect(sentData.description).toBe('Monthly salary');
    
    // Check if the form was reset
    expect(screen.getByLabelText(/Type/i)).toHaveValue('expense');
    expect(screen.getByLabelText(/Amount/i)).toHaveValue(null);
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
  });
  
  test('handles API error during form submission', async () => {
    mockAxios.onPost('http://localhost:5000/api/transactions').reply(400, { msg: 'Invalid data' });
    
    render(<TransactionForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { name: 'amount', value: '100' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(window.alert).toHaveBeenCalledWith('Invalid data');
    });
  });
  
  test('handles missing authentication token', async () => {
    // Mock localStorage to return null for token
    window.localStorage.getItem.mockReturnValueOnce(null);
    
    render(<TransactionForm />);
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }));
    
    // Check if alert was shown
    expect(window.alert).toHaveBeenCalledWith('Authentication token is missing. Please log in.');
    
    // Verify no API call was made
    expect(mockAxios.history.post.length).toBe(0);
  });
  
  test('handles tags input correctly', () => {
    render(<TransactionForm />);
    
    // Enter tags
    fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 'food,lunch,restaurant' } });
    expect(screen.getByLabelText(/Tags/i)).toHaveValue('food,lunch,restaurant');
    
    // Change to different tags
    fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 'dinner,expensive' } });
    expect(screen.getByLabelText(/Tags/i)).toHaveValue('dinner,expensive');
  });
});
