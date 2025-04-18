const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get todos
router.get('/', authenticate, async (req, res) => {
  try {
    let todos;
    if (req.user.role === 'admin') {
      todos = await Todo.find().populate('user', 'username email');
    } else {
      todos = await Todo.find({ user: req.user.id });
    }
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create todo
router.post(
  '/',
  authenticate,
  [
    body('title').isLength({ min: 1, max: 100 }).withMessage('Title required, max 100 chars'),
    body('description').optional().isLength({ max: 500 }),
    body('category').isIn(['Urgent', 'Non-Urgent']).withMessage('Category required'),
    body('dueDate').optional().isISO8601().toDate()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description, dueDate, category } = req.body;
      const todo = new Todo({
        title,
        description,
        dueDate,
        category,
        user: req.user.id
      });
      await todo.save();
      res.status(201).json(todo);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update todo
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().isLength({ min: 1, max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('category').optional().isIn(['Urgent', 'Non-Urgent']),
    body('dueDate').optional().isISO8601().toDate(),
    body('completed').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let todo = await Todo.findById(req.params.id);
      if (!todo) return res.status(404).json({ message: 'Todo not found' });
      if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      Object.assign(todo, req.body);
      await todo.save();
      res.json(todo);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete todo
router.delete('/:id', authenticate, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await todo.deleteOne();
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
