import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AdminCategoryManagement from '../AdminCategoryManagement';

// Mock the child components to focus on testing AdminCategoryManagement
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar" />);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer" />);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AdminCategoryManagement Component', () => {
  let mockAxios;
  
  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const mockCategories = [
    { _id: '1', name: 'Category 1', color: '#FF0000' },
    { _id: '2', name: 'Category 2', color: '#00FF00' }
  ];

  test('renders component correctly', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    
    render(<AdminCategoryManagement />);
    
    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Color')).toBeInTheDocument();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  test('displays "No categories found" when no categories exist', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, []);
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('No categories found.')).toBeInTheDocument();
    });
  });

  test('handles input changes correctly', () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, []);
    
    render(<AdminCategoryManagement />);
    
    const nameInput = screen.getByLabelText('Category Name');
    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    expect(nameInput.value).toBe('New Category');
    
    const colorInput = screen.getByLabelText('Category Color');
    fireEvent.change(colorInput, { target: { value: '#0000FF' } });
    expect(colorInput.value).toBe('#0000FF');
  });

  test('adds a new category successfully', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, []);
    mockAxios.onPost('http://localhost:5000/api/categories').reply(201, { _id: '3', name: 'New Category', color: '#0000FF' });
    
    render(<AdminCategoryManagement />);
    
    // Fill the form
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'New Category' } });
    fireEvent.change(screen.getByLabelText('Category Color'), { target: { value: '#0000FF' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Category'));
    
    // Verify API call
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ name: 'New Category', color: '#0000FF' }));
      expect(mockAxios.history.post[0].headers.Authorization).toBe('Bearer fake-token');
    });
  });

  test('edits a category successfully', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    mockAxios.onPut('http://localhost:5000/api/categories/1').reply(200, { _id: '1', name: 'Updated Category', color: '#0000FF' });
    
    render(<AdminCategoryManagement />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });
    
    // Click edit button on first category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify form is populated with category data
    expect(screen.getByLabelText('Category Name').value).toBe('Category 1');
    expect(screen.getByLabelText('Category Color').value).toBe('#FF0000');
    
    // Update form
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Updated Category' } });
    fireEvent.change(screen.getByLabelText('Category Color'), { target: { value: '#0000FF' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Category'));
    
    // Verify API call
    await waitFor(() => {
      expect(mockAxios.history.put.length).toBe(1);
      expect(mockAxios.history.put[0].data).toBe(JSON.stringify({ name: 'Updated Category', color: '#0000FF' }));
    });
  });

  test('cancels editing a category', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    
    render(<AdminCategoryManagement />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });
    
    // Click edit button on first category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify form is populated with category data
    expect(screen.getByLabelText('Category Name').value).toBe('Category 1');
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify form is reset
    expect(screen.getByLabelText('Category Name').value).toBe('');
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  test('deletes a category successfully', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    mockAxios.onDelete('http://localhost:5000/api/categories/1').reply(200, {});
    
    render(<AdminCategoryManagement />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });
    
    // Click delete button on first category
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify API call
    await waitFor(() => {
      expect(mockAxios.history.delete.length).toBe(1);
      expect(mockAxios.history.delete[0].url).toBe('http://localhost:5000/api/categories/1');
    });
  });

  test('handles API error when fetching categories', async () => {
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    mockAxios.onGet('http://localhost:5000/api/categories').reply(500, { message: 'Server error' });
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles API error when submitting form', async () => {
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, []);
    mockAxios.onPost('http://localhost:5000/api/categories').reply(400, { message: 'Validation error' });
    
    render(<AdminCategoryManagement />);
    
    // Fill the form
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'New Category' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Category'));
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
