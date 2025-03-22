import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManageBudget.css'; // Import your stylesheet
import Header from './UserHeader';
import Footer from './UserFooter';

const ManageBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]); // Fetch categories from backend
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    month: '',
    notifications: true,
  });

  // List of months for the dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching budgets...');
      const response = await axios.get('http://localhost:5000/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Budgets:', response.data);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error.response?.data || error.message);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching notifications...');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Notifications:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching categories...');
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Categories:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchNotifications();
    fetchCategories(); // Fetch categories on component mount
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/budgets', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Budget created:', response.data);
      fetchBudgets(); // Refresh budgets
      fetchNotifications(); // Refresh notifications
      setFormData({ category: '', amount: 0, month: '', notifications: true }); // Reset form
    } catch (error) {
      console.error('Error creating budget:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets(); // Refresh budgets
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  return (
    <>
      <Header />
      <div className="budget-management">
        <h1 className='head'>Budget Management</h1>
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="input-group">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="input-group">
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="" disabled>Select Month</option>
              {months.map((month, index) => (
                <option key={index} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              Enable Notifications
            </label>
          </div>

          <button type="submit" className="submit-button">Add Budget</button>
        </form>

        <div className="budgets-list">
          {budgets.map((budget) => (
            <div key={budget._id} className="budget-item">
              <h3>{budget.category}</h3>
              <p>Amount: ${budget.amount}</p>
              <p>Month: {budget.month}</p>
              <p>Notifications: {budget.notifications ? 'On' : 'Off'}</p>
              <button onClick={() => handleDelete(budget._id)} className="delete-button">Delete</button>
            </div>
          ))}
        </div>

        <div className="notifications-section">
          <h2 style={{ color: 'black' }}>Notifications</h2>
          {notifications.length === 0 ? (
            <p>No notifications found.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification._id} className={notification.read ? 'read' : 'unread'}>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageBudget;
