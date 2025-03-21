import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaMoneyBillWave, FaCog, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import "../styles/AdminSidebar.css"; // Import your stylesheet

const AdminSidebar = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="admin-sidebar">
      <h2 style={{color:'white'}}>Admin Panel</h2>
      <ul>
        <li>
          <Link to="/adminhome">
            <FaTachometerAlt className="icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin-user-management">
            <FaUsers className="icon" /> Manage Users
          </Link>
        </li>
        <li>
          <Link to="/all-transactions">
            <FaMoneyBillWave className="icon" /> Oversee Transactions
          </Link>
        </li>
        <li>
          <Link to="/category-management">
            <FaCog className="icon" /> Manage Categories
          </Link>
        </li>
        <li>
          <Link to="/admin/reports">
            <FaChartBar className="icon" /> Reports
          </Link>
        </li>
      </ul>

      {/* Logout Button */}
      <button className="logout-button" onClick={handleLogout}>
        <FaSignOutAlt className="icon" /> Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
