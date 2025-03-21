import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserHome.css";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";

export default function UserHome() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login"); // Redirect if no token is found
                return;
            }

            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            const userId = decodedToken.id; // Extract user ID from the token

            const response = await axios.get(`http://localhost:5000/api/transactions/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = response.data;
            setTransactions(data);

            // Calculate totals
            let income = 0;
            let expenses = 0;

            data.forEach((transaction) => {
                if (transaction.type === "income") {
                    income += transaction.amount;
                } else if (transaction.type === "expense") {
                    expenses += transaction.amount;
                }
            });

            setTotalIncome(income);
            setTotalExpenses(expenses);
            setTotalBalance(income - expenses);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    fetchTransactions();
}, [navigate]);


  return (
    <>
      <UserHeader />
      <div className="home-container">
        <header className="header1">
          <h1 className="hed1">Your Personal Finance Tracker</h1>
          <p className="p1">Welcome!</p>
        </header>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button" onClick={() => navigate("/manage-budget")}>
              Manage Budget
            </button>
            <button className="action-button" onClick={() => navigate("/transaction")}>
              Manage Transaction
            </button>
            <button className="action-button" onClick={() => navigate("/goals-list")}>
              Manage Goals
            </button>
            <button className="action-button" onClick={() => navigate("/financial-reports")}>
              Financial Reports
            </button>
            <button className="action-button" onClick={() => navigate("/notification")}>
              Notifications
            </button>
          </div>
        </div>


        <div className="financial-overview">
          <div className="overview-card">
            <h2>Total Balance</h2>
            <p>${totalBalance.toFixed(2)}</p>
          </div>
          <div className="overview-card">
            <h2>Income (This Month)</h2>
            <p>${totalIncome.toFixed(2)}</p>
          </div>
          <div className="overview-card">
            <h2>Expenses (This Month)</h2>
            <p>-${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="recent-transactions">
          <h2>Recent Transactions</h2>
          <ul>
            {transactions.slice(-3).reverse().map((transaction) => (
              <li key={transaction._id}>
                <span className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</span>
                <span className="transaction-description">{transaction.description}</span>
                <span
                  className="transaction-amount"
                  style={{ color: transaction.type === "income" ? "green" : "red" }}
                >
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        
      </div>
      <UserFooter />
    </>
  );
}
