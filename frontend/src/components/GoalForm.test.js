import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import GoalForm from '../GoalForm';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock components
jest.mock('../../components/UserHeader', () => () => <div data-testid="user-header">Header</div>);
jest.mock('../../components/UserFooter', () => () => <div data-testid="user-footer">Footer</div>);

describe('GoalForm Component', () => {
  const mockNavigate = jest.fn();
  const mockLocalStorage = {
    getItem: jest.fn(() => 'fake-token'),
  };

  beforeEach(() => {
    // Setup mocks
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: null });
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    jest.clearAllMocks();
  });

  test('renders create goal form correctly', () => {
    render(<GoalForm />);
    
    expect(screen.getByText('Create Goal')).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Amount:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Amount:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deadline:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Goal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /My Goals/i })).toBeInTheDocument();
  });

  test('renders edit goal form and loads goal data', async () => {
    // Mock goal data
    const mockGoal = {
      goalName: 'Test Goal',
      targetAmount: '1000',
      currentAmount: '500',
      deadline: '2023-12-31',
    };
    
    // Setup for edit mode
    useParams.mockReturnValue({ id: '123' });
    axios.get.mockResolvedValueOnce({ data: mockGoal });
    
    render(<GoalForm />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    });
    
    // Verify API call
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/api/goals/123',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
    
    // Verify form fields are populated
    await waitFor(() => {
      expect(screen.getByLabelText(/Goal Name:/i)).toHaveValue('Test Goal');
      expect(screen.getByLabelText(/Target Amount:/i)).toHaveValue(1000);
      expect(screen.getByLabelText(/Current Amount:/i)).toHaveValue(500);
      expect(screen.getByLabelText(/Deadline:/i)).toHaveValue('2023-12-31');
    });
  });

  test('handles input changes correctly', () => {
    render(<GoalForm />);
    
    // Get form inputs
    const nameInput = screen.getByLabelText(/Goal Name:/i);
    const targetInput = screen.getByLabelText(/Target Amount:/i);
    const currentInput = screen.getByLabelText(/Current Amount:/i);
    const deadlineInput = screen.getByLabelText(/Deadline:/i);
    
    // Simulate user input
    fireEvent.change(nameInput, { target: { value: 'New Car' } });
    fireEvent.change(targetInput, { target: { value: '25000' } });
    fireEvent.change(currentInput, { target: { value: '5000' } });
    fireEvent.change(deadlineInput, { target: { value: '2024-06-30' } });
    
    // Verify input values
    expect(nameInput).toHaveValue('New Car');
    expect(targetInput).toHaveValue(25000);
    expect(currentInput).toHaveValue(5000);
    expect(deadlineInput).toHaveValue('2024-06-30');
  });

  test('submits form to create a new goal', async () => {
    axios.post.mockResolvedValueOnce({});
    
    render(<GoalForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Goal Name:/i), { target: { value: 'Vacation' } });
    fireEvent.change(screen.getByLabelText(/Target Amount:/i), { target: { value: '3000' } });
    fireEvent.change(screen.getByLabelText(/Current Amount:/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), { target: { value: '2024-08-15' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Goal/i }));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/goals',
        {
          goalName: 'Vacation',
          targetAmount: '3000',
          currentAmount: '1000',
          deadline: '2024-08-15',
        },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/goals-list');
  });

  test('submits form to update an existing goal', async () => {
    // Setup for edit mode
    useParams.mockReturnValue({ id: '456' });
    const mockGoal = {
      goalName: 'Old Goal',
      targetAmount: '2000',
      currentAmount: '500',
      deadline: '2023-10-31',
    };
    
    axios.get.mockResolvedValueOnce({ data: mockGoal });
    axios.put.mockResolvedValueOnce({});
    
    render(<GoalForm />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Goal Name:/i)).toHaveValue('Old Goal');
    });
    
    // Update form fields
    fireEvent.change(screen.getByLabelText(/Goal Name:/i), { target: { value: 'Updated Goal' } });
    fireEvent.change(screen.getByLabelText(/Target Amount:/i), { target: { value: '2500' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Goal/i }));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/goals/456',
        {
          goalName: 'Updated Goal',
          targetAmount: '2500',
          currentAmount: '500',
          deadline: '2023-10-31',
        },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/goals-list');
  });

  test('navigates to goals list when My Goals button is clicked', () => {
    render(<GoalForm />);
    
    // Click the My Goals button
    fireEvent.click(screen.getByRole('button', { name: /My Goals/i }));
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/goals-list');
  });

  test('handles API error when fetching goal', async () => {
    // Setup for edit mode with API error
    useParams.mockReturnValue({ id: '789' });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    render(<GoalForm />);
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    // Verify the form still renders
    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });

  test('handles API error when submitting form', async () => {
    // Setup for form submission error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValueOnce(new Error('Submission error'));
    
    render(<GoalForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Goal Name:/i), { target: { value: 'Test Goal' } });
    fireEvent.change(screen.getByLabelText(/Target Amount:/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Current Amount:/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), { target: { value: '2024-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Goal/i }));
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    // Verify navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
