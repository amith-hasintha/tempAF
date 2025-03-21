import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import TransactionList from "./components/TransactionList";
import TransactionForm from "./components/TransactionForm";
import { jwtDecode } from "jwt-decode";
import TransactionItem from "./components/TransactionItem";
import GoalForm from "./components/GoalForm";
import GoalsList from "./components/GoalList";
import AdminHome from "./components/AdminHome";
import UserHome from "./components/UserDashboard";
import ManageBudget from "./components/ManageBudget";
import FinancialReports from "./components/FinancialReports";
import Notifications from "./components/Notification";
import AdminCategoryManagement from "./components/AdminCategoryManagement";
import AdminUserManagement from "./components/AdminUserManagement";
import CategoryManagement from "./components/CategoryManage";
import AdminReports from "./components/AdminReport";

const getToken = () => localStorage.getItem("token");

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

const isTokenValid = (token) => {
  const decoded = decodeToken(token);
  return decoded && decoded.exp * 1000 > Date.now();
};

const isAdmin = (token) => {
  const decoded = decodeToken(token);
  console.log("isAdmin:", isAdmin);
  return decoded?.role === "admin";
};

const isUser = (token) => {
  const decoded = decodeToken(token);
  console.log("isUser:", isUser);
  return decoded?.role === "user";
};

const ProtectedRoute = ({ children, adminOnly, useronly }) => {
  const token = getToken();

  if (!token || !isTokenValid(token)) {
    console.log("No token or not authenticated. Redirecting to login.");
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin(token)) {
    console.log("User is not admin. Redirecting to login.");
    return <Navigate to="/login" />;
  }

  if (useronly && !isUser(token)) {
    console.log("User role is not allowed. Redirecting to login.");
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            
            {/* Protected Transaction Routes */}
            <Route
              path="/all-transactions"
              element={
                <ProtectedRoute>
                  <TransactionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-transaction"
              element={
                <ProtectedRoute>
                  <TransactionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction"
              element={
                <ProtectedRoute>
                  <TransactionItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goal-form"
              element={
                <ProtectedRoute>
                  <GoalForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals-list"
              element={
                <ProtectedRoute>
                  <GoalsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminhome"
              element={
                <ProtectedRoute>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-home"
              element={
                <ProtectedRoute>
                  <UserHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-budget"
              element={
                <ProtectedRoute>
                  <ManageBudget />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/financial-reports"
              element={
                <ProtectedRoute>
                  <FinancialReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-category-management"
              element={
                <ProtectedRoute>
                  <AdminCategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-user-management"
              element={
                <ProtectedRoute>
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/category-management"
              element={
                <ProtectedRoute>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            
              
            
          </Routes>
      </Router>
    </div>
  );
}

export default App;
