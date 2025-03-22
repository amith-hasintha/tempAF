import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import GoalsList from '../GoalList';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GoalsList Component', () => {
  const mockGoals = [
    {
      _id: '1',
      goalName: 'Buy a Car',
      targetAmount: 20000,
      currentAmount: 5000,
      deadline: '2023-12-31T00:00:00.000Z',
    },
    {
      _id: '2',
      goalName: 'Vacation',
      targetAmount: 5000,
      currentAmount: 2000,
      deadline: '2023-10-15T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the axios get request to return goals
    axios.get.mockResolvedValue({ data: mockGoals });
  });

  test('renders the component with goals list', async () => {
    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Check if the component renders the title
    expect(screen.getByText('My Goals')).toBeInTheDocument();

    // Wait for goals to be loaded
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
      expect(screen.getByText('Vacation')).toBeInTheDocument();
    });

    // Verify axios was called with correct parameters
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/goals', {
      headers: {
        Authorization: 'Bearer fake-token',
      },
    });
  });

  test('deletes a goal when delete button is clicked', async () => {
    axios.delete.mockResolvedValue({});

    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Wait for goals to be loaded
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });

    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify axios delete was called with correct parameters
    expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/api/goals/1', {
      headers: {
        Authorization: 'Bearer fake-token',
      },
    });

    // After successful deletion, the goal should be removed from the list
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
  });

  test('enters edit mode when edit button is clicked', async () => {
    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Wait for goals to be loaded
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });

    // Find all edit buttons and click the first one
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check if edit form is displayed
    expect(screen.getByText('Goal Name:')).toBeInTheDocument();
    expect(screen.getByText('Target Amount:')).toBeInTheDocument();
    expect(screen.getByText('Current Amount:')).toBeInTheDocument();
    expect(screen.getByText('Deadline:')).toBeInTheDocument();
    
    // Check if Save and Cancel buttons are displayed
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('cancels edit mode when cancel button is clicked', async () => {
    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Wait for goals to be loaded
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Check if we're back to view mode
    await waitFor(() => {
      expect(screen.queryByText('Goal Name:')).not.toBeInTheDocument();
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
  });

  test('saves changes when save button is clicked', async () => {
    const updatedGoal = {
      _id: '1',
      goalName: 'Buy a New Car',
      targetAmount: 25000,
      currentAmount: 6000,
      deadline: '2024-01-31T00:00:00.000Z',
    };

    axios.put.mockResolvedValue({ data: updatedGoal });

    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Wait for goals to be loaded
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Update the goal name
    const goalNameInput = screen.getByLabelText('Goal Name:');
    fireEvent.change(goalNameInput, { target: { value: 'Buy a New Car' } });

    // Update target amount
    const targetAmountInput = screen.getByLabelText('Target Amount:');
    fireEvent.change(targetAmountInput, { target: { value: '25000' } });

    // Update current amount
    const currentAmountInput = screen.getByLabelText('Current Amount:');
    fireEvent.change(currentAmountInput, { target: { value: '6000' } });

    // Click save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Verify axios put was called with correct parameters
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:5000/api/goals/1',
      expect.objectContaining({
        _id: '1',
        goalName: 'Buy a New Car',
        targetAmount: '25000',
        currentAmount: '6000',
      }),
      {
        headers: {
          Authorization: 'Bearer fake-token',
        },
      }
    );
  });

  test('navigates to goal form when "Make Goals" button is clicked', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Click the "Make Goals" button
    const makeGoalsButton = screen.getByText('Make Goals');
    fireEvent.click(makeGoalsButton);

    // Verify navigation was called with correct path
    expect(navigateMock).toHaveBeenCalledWith('/goal-form');
  });

  test('handles API error when fetching goals', async () => {
    // Mock console.error to prevent error messages in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Mock axios to throw an error
    axios.get.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Wait for the API call to complete
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching goals:', expect.any(Error));
    });

    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles API error when deleting a goal', async () => {
    // Mock console.error to prevent error messages in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // First mock successful get
    axios.get.mockResolvedValue({ data: mockGoals });
    
    // Then mock delete to fail
    axios.delete.mockRejectedValue(new Error('Delete failed'));

    render(
      <BrowserRouter>
        <GoalsList />
      </BrowserRouter>
    );

    // Wait for goals to be loaded
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });

    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error deleting goal:', expect.any(Error));
    });

    // Restore console.error
    console.error = originalConsoleError;
  });
});
