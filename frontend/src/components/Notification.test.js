import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Notifications from '../Notification';

// Mock axios
jest.mock('axios');

// Mock the UserHeader and UserFooter components
jest.mock('../UserHeader', () => () => <div data-testid="user-header">Header</div>);
jest.mock('../UserFooter', () => () => <div data-testid="user-footer">Footer</div>);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Notifications Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves to keep loading state
    
    render(<Notifications />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays message when no notifications are found', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('No notifications found.')).toBeInTheDocument();
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/api/notifications',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
  });

  test('displays notifications when they exist', async () => {
    const mockNotifications = [
      { 
        _id: '1', 
        message: 'Test notification 1', 
        read: false, 
        createdAt: '2023-01-01T12:00:00Z' 
      },
      { 
        _id: '2', 
        message: 'Test notification 2', 
        read: true, 
        createdAt: '2023-01-02T12:00:00Z' 
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Test notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test notification 2')).toBeInTheDocument();
    });
    
    // Check that unread notification has "Mark as Read" button
    expect(screen.getByText('Mark as Read')).toBeInTheDocument();
    
    // Check that read notification doesn't have "Mark as Read" button
    const buttons = screen.getAllByRole('button', { name: 'Mark as Read' });
    expect(buttons.length).toBe(1);
  });

  test('handles marking a notification as read', async () => {
    const mockNotifications = [
      { 
        _id: '1', 
        message: 'Test notification 1', 
        read: false, 
        createdAt: '2023-01-01T12:00:00Z' 
      }
    ];
    
    // First API call to get notifications
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    
    // Second API call for marking as read
    axios.put.mockResolvedValueOnce({});
    
    // Third API call to refresh notifications after marking as read
    axios.get.mockResolvedValueOnce({ 
      data: [{ 
        _id: '1', 
        message: 'Test notification 1', 
        read: true, 
        createdAt: '2023-01-01T12:00:00Z' 
      }] 
    });
    
    render(<Notifications />);
    
    // Wait for initial notifications to load
    await waitFor(() => {
      expect(screen.getByText('Test notification 1')).toBeInTheDocument();
    });
    
    // Click "Mark as Read" button
    fireEvent.click(screen.getByText('Mark as Read'));
    
    // Verify the API call was made correctly
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:5000/api/notifications/1',
      null,
      { headers: { Authorization: 'Bearer fake-token' } }
    );
    
    // Verify the notifications were refreshed
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  test('handles error when fetching notifications', async () => {
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    render(<Notifications />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching notifications:', expect.any(Error));
    });
    
    // Should show empty state after error
    expect(screen.getByText('No notifications found.')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles error when marking notification as read', async () => {
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const mockNotifications = [
      { 
        _id: '1', 
        message: 'Test notification 1', 
        read: false, 
        createdAt: '2023-01-01T12:00:00Z' 
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    axios.put.mockRejectedValueOnce(new Error('API error'));
    
    render(<Notifications />);
    
    // Wait for initial notifications to load
    await waitFor(() => {
      expect(screen.getByText('Test notification 1')).toBeInTheDocument();
    });
    
    // Click "Mark as Read" button
    fireEvent.click(screen.getByText('Mark as Read'));
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error marking notification as read:', expect.any(Error));
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
