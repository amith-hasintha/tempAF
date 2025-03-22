import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminFooter from '../AdminFooter';

describe('AdminFooter Component', () => {
  test('renders without crashing', () => {
    render(<AdminFooter />);
  });

  test('renders footer with correct class name', () => {
    const { container } = render(<AdminFooter />);
    const footerElement = container.querySelector('footer');
    expect(footerElement).toHaveClass('admin-footer');
  });

  test('displays copyright text', () => {
    render(<AdminFooter />);
    const copyrightText = screen.getByText(/all rights reserved/i);
    expect(copyrightText).toBeInTheDocument();
  });

  test('displays powered by text', () => {
    render(<AdminFooter />);
    const poweredByText = screen.getByText(/powered by amith hasintha/i);
    expect(poweredByText).toBeInTheDocument();
  });

  test('contains exactly two paragraph elements', () => {
    const { container } = render(<AdminFooter />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
  });
});
