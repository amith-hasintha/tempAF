import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AdminUserManagement from '../AdminUserManagement';

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

// Mock window.confirm
window.confirm = jest.fn();

describe('AdminUserManagement Component', () => {
  const mockUsers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockUsers });
    window.confirm.mockImplementation(() => true);
  });

  test('renders component with loading state initially', () => {
    render(<AdminUserManagement />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  test('fetches and displays users', async () => {
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/auth/get', {
        headers: { Authorization: 'Bearer fake-token' }
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('handles error when fetching users fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Error fetching users.')).toBeInTheDocument();
    });
  });

  test('deletes a user when delete button is clicked and confirmed', async () => {
    axios.delete.mockResolvedValueOnce({});
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const deleteButtons = await screen.findAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/api/auth/1/delete', {
        headers: { Authorization: 'Bearer fake-token' }
      });
    });
  });

  test('does not delete a user when confirmation is cancelled', async () => {
    window.confirm.mockImplementationOnce(() => false);
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const deleteButtons = await screen.findAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    expect(axios.delete).not.toHaveBeenCalled();
  });

  test('handles error when deleting user fails', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Delete failed'));
    global.alert = jest.fn();
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const deleteButtons = await screen.findAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to delete user.');
    });
  });

  test('updates user role when role is changed', async () => {
    axios.put.mockResolvedValueOnce({});
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const roleSelects = await screen.findAllByRole('combobox');
    fireEvent.change(roleSelects[0], { target: { value: 'admin' } });
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/1/update',
        { role: 'admin' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('handles error when updating role fails', async () => {
    axios.put.mockRejectedValueOnce(new Error('Update failed'));
    global.alert = jest.fn();
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const roleSelects = await screen.findAllByRole('combobox');
    fireEvent.change(roleSelects[0], { target: { value: 'admin' } });
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to update user role.');
    });
  });

  test('displays "No users found" when user list is empty', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<AdminUserManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });

  test('renders AdminSidebar and AdminFooter components', async () => {
    render(<AdminUserManagement />);
    
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
  });
});
