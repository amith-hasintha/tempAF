import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminFooter from "./AdminFooter";
import "../styles/AdminHome.css";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/get", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
    }
  };

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchCategories();
  }, []);

  return (
    <>
      <AdminSidebar />
      <div className="admin-content">
        <h1>Admin Dashboard</h1>

        {/* Manage Users Section */}
        <section className="manage-users">
          <h2>All Users</h2>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Oversee Transactions Section */}
        <section className="oversee-transactions">
          <h2>All Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.type}</td>
                  <td>${transaction.amount}</td>
                  <td>{transaction.category}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        
      </div>
      <AdminFooter />
    </>
  );
};

export default AdminHome;
