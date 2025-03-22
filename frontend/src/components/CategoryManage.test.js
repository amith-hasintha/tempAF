import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import CategoryManagement from '../CategoryManage';

// Mock axios
jest.mock('axios');

// Mock components that are not under test
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar" />);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer" />);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CategoryManagement Component', () => {
  const mockCategories = [
    { _id: '1', name: 'Electronics' },
    { _id: '2', name: 'Books' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    axios.get.mockResolvedValue({ data: mockCategories });
    axios.post.mockResolvedValue({ data: { _id: '3', name: 'New Category' } });
    axios.put.mockResolvedValue({ data: { _id: '1', name: 'Updated Electronics' } });
    axios.delete.mockResolvedValue({});
  });

  test('renders the component with sidebar and footer', () => {
    render(<CategoryManagement />);
    
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
    expect(screen.getByText('Category Management')).toBeInTheDocument();
  });

  test('fetches and displays categories on mount', async () => {
    render(<CategoryManagement />);
    
    // Verify axios.get was called with correct URL and headers
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/categories', {
      headers: { Authorization: 'Bearer fake-token' }
    });
    
    // Wait for categories to be displayed
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });
  });

  test('handles adding a new category', async () => {
    render(<CategoryManagement />);
    
    // Fill out the form
    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });
    
    // Submit the form
    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);
    
    // Verify axios.post was called with correct data
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:5000/api/categories',
      { name: 'New Category' },
      { headers: { Authorization: 'Bearer fake-token' } }
    );
    
    // Verify form was reset
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  test('handles editing a category', async () => {
    render(<CategoryManagement />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    
    // Click edit button on first category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify form is populated with category name
    const input = screen.getByPlaceholderText('Category Name');
    expect(input.value).toBe('Electronics');
    
    // Change the value
    fireEvent.change(input, { target: { value: 'Updated Electronics' } });
    
    // Submit the form
    const updateButton = screen.getByText('Update Category');
    fireEvent.click(updateButton);
    
    // Verify axios.put was called with correct data
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:5000/api/categories/1',
      { name: 'Updated Electronics' },
      { headers: { Authorization: 'Bearer fake-token' } }
    );
    
    // Verify form was reset
    await waitFor(() => {
      expect(input.value).toBe('');
      // Button should change back to "Add Category"
      expect(screen.getByText('Add Category')).toBeInTheDocument();
    });
  });

  test('handles deleting a category', async () => {
    render(<CategoryManagement />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    
    // Click delete button on first category
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify axios.delete was called with correct URL
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:5000/api/categories/1',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
  });

  test('displays error message when API call fails', async () => {
    // Mock console.error to test error handling
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock a failed API call
    axios.get.mockRejectedValueOnce({ 
      response: { data: 'Server error' }
    });
    
    render(<CategoryManagement />);
    
    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching categories:',
        'Server error'
      );
    });
    
    // Verify "No categories available" message is shown
    expect(screen.getByText('No categories available.')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles form submission errors', async () => {
    // Mock console.error to test error handling
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock a failed API call for post
    axios.post.mockRejectedValueOnce({ 
      response: { data: 'Validation error' }
    });
    
    render(<CategoryManagement />);
    
    // Fill out the form
    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'Invalid Category' } });
    
    // Submit the form
    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);
    
    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error submitting category:',
        'Validation error'
      );
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
