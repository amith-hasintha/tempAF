import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportChart from '../ReportChart';
import { Bar } from 'react-chartjs-2';

// Mock the chart.js component since it's not easily testable in JSDOM
jest.mock('react-chartjs-2', () => ({
  Bar: jest.fn(() => <div data-testid="bar-chart" />)
}));

describe('ReportChart Component', () => {
  const mockData = {
    labels: ['Food', 'Transport', 'Entertainment', 'Utilities'],
    datasets: [
      {
        label: 'Income',
        data: [1000, 500, 200, 300],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: [800, 400, 300, 200],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  beforeEach(() => {
    Bar.mockClear();
  });

  test('renders without crashing', () => {
    render(<ReportChart data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('passes correct data to Bar component', () => {
    render(<ReportChart data={mockData} />);
    expect(Bar).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockData
      }),
      expect.anything()
    );
  });

  test('configures chart options correctly', () => {
    render(<ReportChart data={mockData} />);
    
    const expectedOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Income vs Expenses by Category',
        },
      },
    };
    
    expect(Bar).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expectedOptions
      }),
      expect.anything()
    );
  });

  test('applies correct CSS class', () => {
    const { container } = render(<ReportChart data={mockData} />);
    expect(container.firstChild).toHaveClass('report-chart');
  });

  test('handles empty data gracefully', () => {
    const emptyData = {
      labels: [],
      datasets: []
    };
    
    render(<ReportChart data={emptyData} />);
    expect(Bar).toHaveBeenCalledWith(
      expect.objectContaining({
        data: emptyData
      }),
      expect.anything()
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('handles null data without crashing', () => {
    // This test verifies the component doesn't crash with null data
    // In a real application, you might want to add validation or default values
    expect(() => render(<ReportChart data={null} />)).not.toThrow();
  });
});
