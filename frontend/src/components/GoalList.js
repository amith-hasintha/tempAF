import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/GoalsList.css";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";

const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editedGoal, setEditedGoal] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/goals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGoals(response.data);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(goals.filter((goal) => goal._id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal._id);
    setEditedGoal({ ...goal });
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setEditedGoal(null);
  };

  const handleInputChange = (e, field) => {
    setEditedGoal({ ...editedGoal, [field]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/goals/${editedGoal._id}`,
        editedGoal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGoals(goals.map((goal) => (goal._id === editedGoal._id ? response.data : goal)));
      setEditingGoal(null);
      setEditedGoal(null);
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="goals-list-container">
        <h1>My Goals</h1>
        {goals.map((goal) => (
          <div key={goal._id} className="goals-list-card">
            {editingGoal === goal._id ? (
              <div className="edit-goal-form">
                <div className="input-container">
                  <label>Goal Name:</label>
                  <input
                    type="text"
                    value={editedGoal.goalName}
                    onChange={(e) => handleInputChange(e, "goalName")}
                    required
                  />
                </div>
                <div className="input-container">
                  <label>Target Amount:</label>
                  <input
                    type="number"
                    value={editedGoal.targetAmount}
                    onChange={(e) => handleInputChange(e, "targetAmount")}
                    required
                  />
                </div>
                <div className="input-container">
                  <label>Current Amount:</label>
                  <input
                    type="number"
                    value={editedGoal.currentAmount}
                    onChange={(e) => handleInputChange(e, "currentAmount")}
                    required
                  />
                </div>
                <div className="input-container">
                  <label>Deadline:</label>
                  <input
                    type="date"
                    value={new Date(editedGoal.deadline).toISOString().split("T")[0]}
                    onChange={(e) => handleInputChange(e, "deadline")}
                    required
                  />
                </div>
                <div className="goals-list-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                  <button onClick={handleSaveChanges}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2>{goal.goalName}</h2>
                <p>Target Amount: ${goal.targetAmount}</p>
                <p>Current Amount: ${goal.currentAmount}</p>
                <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                <div className="goals-list-progress-bar">
                  <div
                    className="goals-list-progress"
                    style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                  />
                </div>
                <div className="goals-list-actions">
                  <button onClick={() => handleEditClick(goal)}>Edit</button>
                  <button onClick={() => handleDelete(goal._id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}

        <button className="goals-list-action-button" onClick={() => navigate("/goal-form")}>
          Make Goals
        </button>
      </div>
      <UserFooter />
    </>
  );
};

export default GoalsList;
