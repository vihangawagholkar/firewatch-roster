import React, { useState } from 'react';
import axios from '../api/api';
import { useNavigate } from 'react-router-dom';
import './loginPage.css'; // Reuse same styles

const RegisterPage = () => {
  const [form, setForm] = useState({ id: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        id: form.id,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-logo animate-logo">🪖 Firewatch Roster</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            placeholder="ID"
            value={form.id}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Register</button>
        </form>
        <p className="register-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;