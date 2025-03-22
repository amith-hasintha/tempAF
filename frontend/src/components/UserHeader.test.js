import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserHeader from '../UserHeader';
import { useNavigate } from 'react-router-dom';

// Mock the react-router-dom useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('UserHeader Component', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock localStorage and sessionStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        removeItem: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
    
    // Reset navigate mock
    useNavigate.mockReset();
    useNavigate.mockReturnValue(jest.fn());
  });

  test('renders header with correct title', () => {
    render(<UserHeader />);
    expect(screen.getByText('FinanceTracker')).toBeInTheDocument();
  });

  test('renders all navigation links', () => {
    render(<UserHeader />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    render(<UserHeader />);
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/user-home');
    expect(screen.getByText('Transactions').closest('a')).toHaveAttribute('href', '/transaction');
    expect(screen.getByText('Goals').closest('a')).toHaveAttribute('href', '/goals-list');
    expect(screen.getByText('Contact').closest('a')).toHaveAttribute('href', '#contact');
  });

  test('logout button clears storage and navigates to login page', () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    render(<UserHeader />);
    
    // Click the logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Verify localStorage and sessionStorage items were removed
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('userSession');
    
    // Verify navigation to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('header has the correct CSS class', () => {
    const { container } = render(<UserHeader />);
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.header-container')).toBeInTheDocument();
    expect(container.querySelector('.logo-name')).toBeInTheDocument();
    expect(container.querySelector('.nav-menu')).toBeInTheDocument();
  });
});
