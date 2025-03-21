import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/ReportChart.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportChart = ({ data }) => {
  const options = {
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

  return (
    <div className="report-chart">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ReportChart;