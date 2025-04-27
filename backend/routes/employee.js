const express = require('express');
const Employee = require('../models/Employee');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Get employees for a user
router.get('/:userId', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).populate('employees');
  res.json(user.employees);
});

// Add a new employee
router.post('/', requireAuth, async (req, res) => {
  const { name, rank, battery, phone } = req.body;
  const employee = new Employee({ name, rank, battery, phone });
  await employee.save();

  const user = await User.findById(req.userId);
  user.employees.push(employee);
  await user.save();

  res.status(201).json(employee);
});

// Edit employee data
router.put('/:employeeId', requireAuth, async (req, res) => {
  const { name, rank, battery, phone, leaves } = req.body;
  const employee = await Employee.findByIdAndUpdate(req.params.employeeId, {
    name, rank, battery, phone, leaves
  }, { new: true });

  res.json(employee);
});

module.exports = router;