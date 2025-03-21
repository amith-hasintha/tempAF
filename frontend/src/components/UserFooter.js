import React from "react";
import "../styles/UserFooter.css";

export default function UserFooter() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>FinanceTracker</h3>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/user-home">Home</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <ul>
                        <li>Email: financetracker@gmail.com</li>
                        <li>Phone: 0786268818</li>
                        <li>Address: Malabe,Sri Lanka</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        <a href="#facebook" className="social-link">Facebook</a>
                        <a href="#twitter" className="social-link">Twitter</a>
                        <a href="#linkedin" className="social-link">LinkedIn</a>
                        <a href="#instagram" className="social-link">Instagram</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; Amith Hasintha. All rights reserved.</p>
            </div>
        </footer>
    );
}