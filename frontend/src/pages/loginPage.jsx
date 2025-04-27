import React, { useState, useEffect } from 'react';  // Import useEffect here
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();  // Get isAuthenticated and loading from AuthContext
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ id: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log("Attempting to log in...");
      await login(form);
      console.log("Login successful!");
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

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
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>Login</button>
        </form>
        <p className="register-link">
          Don&apos;t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;