import React, { useState } from "react";
import axios from "axios";
import UserFooter from "./UserFooter";
import UserHeader from "./UserHeader";
import "../styles/TransactionForm.css";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TransactionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "food",
    description: "",
    tags: [],
    isRecurring: false,
    recurrencePattern: "",
    recurrenceEndDate: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { type, amount, category, description, tags, isRecurring, recurrencePattern, recurrenceEndDate, date } =
    formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token is missing. Please log in.");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post("http://localhost:5000/api/transactions", formData, config);

      setFormData({
        type: "expense",
        amount: "",
        category: "food",
        description: "",
        tags: [],
        isRecurring: false,
        recurrencePattern: "",
        recurrenceEndDate: "",
        date: new Date().toISOString().split("T")[0],
      });

      alert("Transaction added successfully!");
      navigate("/transaction");
    } catch (error) {
      alert(error.response?.data?.msg || "Failed to add transaction. Please try again.");
    }
  };

  return (
    <>
      <UserHeader />
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="form-title">
            <FaPlusCircle className="icon" /> Add Transaction
          </h2>

          <div className="form-group">
            <label style={{color:'white'}}>Type</label>
            <select name="type" value={type} onChange={handleChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{color:'white'}}>Amount</label>
            <input style={{width:'100%'}} type="number" name="amount" value={amount} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label style={{color:'white'}}>Category</label>
            <select name="category" value={category} onChange={handleChange}>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="salary">Salary</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{color:'white'}}>Description</label>
            <input type="text" name="description" value={description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label style={{color:'white'}}>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={tags.join(",")}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",") })}
            />
          </div>

          <div className="form-group checkbox-group">
            <label style={{color:'white'}}>
              <input type="checkbox" name="isRecurring" checked={isRecurring} onChange={handleCheckboxChange} />
              Recurring Transaction
            </label>
          </div>

          {isRecurring && (
            <>
              <div className="form-group">
                <label style={{color:'white'}}>Recurrence Pattern</label>
                <select name="recurrencePattern" value={recurrencePattern} onChange={handleChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{color:'white'}}>Recurrence End Date</label>
                <input type="date" name="recurrenceEndDate" value={recurrenceEndDate} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label style={{color:'white'}}>Date</label>
            <input type="date" name="date" value={date} onChange={handleChange} />
          </div>

          <button className="submit-button" type="submit">
            Add Transaction
          </button>
        </form>
      </div>
      <UserFooter />
    </>
  );
};

export default TransactionForm;
