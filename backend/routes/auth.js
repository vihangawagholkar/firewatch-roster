const express = require('express');
const bcrypt = require('bcryptjs');
const { createToken } = require('../utils/auth');
const User = require('../models/User');
const Employee = require('../models/Employee');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,   // Only use on HTTPS
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ user,message: 'Logged in successfully' });
});

// Register route
router.post('/register', async (req, res) => {
  const { id, password } = req.body;

  const existingUser = await User.findOne({ id });
  if (existingUser) return res.status(400).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ id, password: hashedPassword });
  await user.save();

  res.json({ message: 'User registered successfully' });
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;