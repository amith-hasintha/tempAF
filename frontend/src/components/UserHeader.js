import React from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import "../styles/UserHeader.css";

export default function UserHeader() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data (adjust based on your auth method)
        localStorage.removeItem("token"); 
        sessionStorage.removeItem("userSession"); 
        
        // Redirect to login page
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-name">
                    <h1>FinanceTracker</h1>
                </div>
                <nav className="nav-menu">
                    <a href="/user-home" className="nav-link">Home</a>
                    <a href="/transaction" className="nav-link">Transactions</a>
                    <a href="/goals-list" className="nav-link">Goals</a>
                    <a href="#contact" className="nav-link">Contact</a>
                    <button className="nav-link login-button" onClick={handleLogout}>Logout</button>
                </nav>
            </div>
        </header>
    );
}
