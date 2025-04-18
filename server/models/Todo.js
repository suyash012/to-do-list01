const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  dueDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['Urgent', 'Non-Urgent'],
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

todoSchema.index({ user: 1 }); // Index for user queries

module.exports = mongoose.model('Todo', todoSchema);
