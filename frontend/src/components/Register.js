import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css"; // Import updated CSS

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/create", form);
      alert(response.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 style={{color:'black'}}>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input-field" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input-field" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input-field" />
          <button type="submit" className="register-button">Register</button>
        </form>
        <p className="login-link">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default Register;
