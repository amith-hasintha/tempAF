import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserFooter from '../UserFooter';

describe('UserFooter Component', () => {
  beforeEach(() => {
    render(<UserFooter />);
  });

  test('renders without crashing', () => {
    expect(screen.getByText('FinanceTracker')).toBeInTheDocument();
  });

  test('displays all footer sections', () => {
    expect(screen.getByText('FinanceTracker')).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
  });

  test('displays correct quick links', () => {
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/user-home');
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');
  });

  test('displays correct contact information', () => {
    expect(screen.getByText('Email: financetracker@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Phone: 0786268818')).toBeInTheDocument();
    expect(screen.getByText('Address: Malabe,Sri Lanka')).toBeInTheDocument();
  });

  test('displays social media links', () => {
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', '#facebook');
    expect(screen.getByRole('link', { name: 'Twitter' })).toHaveAttribute('href', '#twitter');
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', '#linkedin');
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', '#instagram');
  });

  test('displays copyright information', () => {
    expect(screen.getByText(/© Amith Hasintha. All rights reserved./)).toBeInTheDocument();
  });

  test('has the correct CSS classes', () => {
    expect(document.querySelector('.footer')).toBeInTheDocument();
    expect(document.querySelector('.footer-container')).toBeInTheDocument();
    expect(document.querySelectorAll('.footer-section').length).toBe(4);
    expect(document.querySelector('.social-links')).toBeInTheDocument();
    expect(document.querySelector('.footer-bottom')).toBeInTheDocument();
  });
});
