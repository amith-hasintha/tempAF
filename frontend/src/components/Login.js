import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import updated CSS

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      response.data.user.role === "admin" ? navigate("/adminhome") : navigate("/user-home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input-field" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input-field" />
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="register-link">Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
};

export default Login;
