import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportFilters from './ReportFilters';
import ReportChart from './ReportChart';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';
import '../styles/FinancialReports.css';

const FinancialReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    timePeriod: 'monthly',
    category: '',
    tag: '',
  });

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const userId = decodedToken.id;

  // Fetch transactions from the backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [token]);

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesCategory = filters.category ? transaction.category === filters.category : true;
    const matchesTag = filters.tag ? transaction.tags.some(tag => tag.name === filters.tag) : true;
    return matchesCategory && matchesTag;
  });

  // Aggregate transactions by category and type
  const aggregateTransactions = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const { category, type, amount } = transaction;
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 };
      }
      acc[category][type] += amount;
      return acc;
    }, {});
  };

  const aggregatedData = aggregateTransactions(filteredTransactions);

  // Prepare data for the chart
  const chartData = {
    labels: Object.keys(aggregatedData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(aggregatedData).map(data => data.income),
        backgroundColor: '#00e676',
      },
      {
        label: 'Expenses',
        data: Object.values(aggregatedData).map(data => data.expense),
        backgroundColor: '#f8b400',
      },
    ],
  };

  return (
    <>
      <UserHeader />
      <div className="financial-reports-container">
        <h1>Financial Reports</h1>
        <ReportFilters onFilterChange={setFilters} />
        <ReportChart data={chartData} />
        <div className="reports-list">
          {Object.entries(aggregatedData).map(([category, data]) => (
            <div key={category} className="report-card">
              <h2>{category}</h2>
              <p>Income: ${data.income}</p>
              <p>Expenses: ${data.expense}</p>
              <p>Net: ${data.income - data.expense}</p>
            </div>
          ))}
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default FinancialReports;