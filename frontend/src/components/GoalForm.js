import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/GoalForm.css'; // Import the CSS normally
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const GoalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState({
    goalName: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  useEffect(() => {
    if (id) {
      const fetchGoal = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/goals/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGoal(response.data);
        } catch (error) {
          console.error('Error fetching goal:', error);
        }
      };

      fetchGoal();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoal((prevGoal) => ({ ...prevGoal, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const url = id ? `http://localhost:5000/api/goals/${id}` : 'http://localhost:5000/api/goals';
      const method = id ? 'put' : 'post';

      await axios[method](url, goal, config);
      navigate('/goals-list');
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  return (
    <>
    <UserHeader/>
      <div className="formContainer">
        <form onSubmit={handleSubmit} className="goalForm">
          <h1>{id ? 'Edit Goal' : 'Create Goal'}</h1>

          <div className="formGroup1">
            <label htmlFor="goalName">Goal Name:</label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={goal.goalName}
              onChange={handleChange}
              placeholder="Enter your goal name"
              required
            />
          </div>

          <div className="formGroup1">
            <label htmlFor="targetAmount">Target Amount:</label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={goal.targetAmount}
              onChange={handleChange}
              placeholder="Enter target amount"
              min="0"
              required
            />
          </div>

          <div className="formGroup1">
            <label htmlFor="currentAmount">Current Amount:</label>
            <input
              type="number"
              id="currentAmount"
              name="currentAmount"
              value={goal.currentAmount}
              onChange={handleChange}
              placeholder="Enter current amount"
              min="0"
              required
            />
          </div>

          <div className="formGroup1">
            <label htmlFor="deadline">Deadline:</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={goal.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="buttonGroup1">
            <button type="submit" className="submitButton">
              {id ? 'Update Goal' : 'Create Goal'}
            </button>
            <button type="button" className="secondaryButton" onClick={() => navigate('/goals-list')}>
              My Goals
            </button>
          </div>
        </form>
      </div>
      <UserFooter/>
    </>
  );
};

export default GoalForm;
