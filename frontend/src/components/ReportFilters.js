import React, { useState } from 'react';
import '../styles/ReportFilters.css';

const ReportFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    timePeriod: 'monthly',
    category: '',
    tag: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="report-filters">
      <label>
        Time Period:
        <select
          name="timePeriod"
          value={filters.timePeriod}
          onChange={handleInputChange}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>
      <label>
        Category:
        <input
          type="text"
          name="category"
          value={filters.category}
          onChange={handleInputChange}
          placeholder="Enter category"
        />
      </label>
      <label>
        Tag:
        <input
          type="text"
          name="tag"
          value={filters.tag}
          onChange={handleInputChange}
          placeholder="Enter tag"
        />
      </label>
      <br/>
      <button type="submit" className='sub11'>Apply Filters</button>
    </form>
  );
};

export default ReportFilters;