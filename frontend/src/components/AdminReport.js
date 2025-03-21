import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../styles/AdminReport.css";

const AdminReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]); // State to store the list of users
  const [selectedUser, setSelectedUser] = useState(""); // State to store the selected user ID

  // Fetch all users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/get', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch transactions based on the selected user
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = selectedUser
          ? `http://localhost:5000/api/transactions/${selectedUser}`
          : "http://localhost:5000/api/transactions/";
  
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        const data = await response.json();
        console.log("Fetched Transactions:", data); // Debugging log
  
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]); // Ensure transactions is always an array
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]); // Prevents undefined state
      }
    };
  
    fetchTransactions();
  }, [selectedUser]);
  

  // Prepare data for charts
  const incomeData = transactions.filter(t => t.type === 'income');
  const expenseData = transactions.filter(t => t.type === 'expense');

  const incomeByCategory = incomeData.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const expenseByCategory = expenseData.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const incomeChartData = Object.keys(incomeByCategory).map(key => ({
    name: key,
    value: incomeByCategory[key],
  }));

  const expenseChartData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key],
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <><AdminSidebar /><div className="admin-reports-container">

          <div className="admin-reports-content">
              <h1>Transaction Reports</h1>

              {/* User Search Dropdown */}
              <div className="user-search">
                  <label htmlFor="user-select">Filter by User: </label>
                  <select
                      id="user-select"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                  >
                      {users.length > 0 ? (
                          users.map(user => (
                              <option key={user._id} value={user._id}>
                                  {user.name || "Unnamed User"}
                              </option>
                          ))
                      ) : (
                          <option disabled>Loading users...</option>
                      )}
                  </select>

              </div>

              {/* Charts */}
              <div className="charts-container">
                  <div className="chart">
                      <h2>Income by Category</h2>
                      <BarChart width={800} height={400} data={incomeChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                  </div>
                  <div className="chart">
                      <h2>Expense by Category</h2>
                      <PieChart width={800} height={400}>
                          <Pie
                              data={expenseChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                          >
                              {expenseChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                      </PieChart>
                  </div>
              </div>
          </div>

      </div><AdminFooter /></>
  );
};

export default AdminReports;