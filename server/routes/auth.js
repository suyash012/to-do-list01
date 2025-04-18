const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('username').isLength({ min: 3 }).withMessage('Username min 3 chars'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, username, password } = req.body;
    try {
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) return res.status(400).json({ message: 'User already exists' });
      const hashed = await bcrypt.hash(password, 10);
      user = new User({ email, username, password: hashed });
      await user.save();
      res.status(201).json({ message: 'User registered' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('identifier').notEmpty().withMessage('Email or username required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { identifier, password } = req.body;
    try {
      const user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { username: identifier }
        ]
      });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
