const express = require('express');
const User = require('../models/User');
const Todo = require('../models/Todo');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all users
router.get('/users', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Change user role
router.patch('/users/:id/role', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all todos
router.get('/todos', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const todos = await Todo.find().populate('user', 'username email');
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
