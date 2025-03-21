import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import the CSS file

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      console.log("Sending request to login:", form);
      const response = await axios.post("http://localhost:5000/api/auth/login", form);
      
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      if (response.data.user.role === "admin") {
        navigate("/adminhome");
      } else if (response.data.user.role === "user") {
      navigate("/user-home");
      }
      
    } catch (err) {
      console.error("Login failed:", err.response?.data);
      setError(err.response?.data?.message || "Login failed");
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="input-field"
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      <p className="register-link">Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default Login;