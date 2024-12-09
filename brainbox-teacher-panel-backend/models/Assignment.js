const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  dueDate: {
    type: Date,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  submissions: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
      status: {
        type: String,
        enum: ['Done', 'Not Done'],
        default: 'Not Done',
      },
      submittedForm: {
        type: String, // File path for submitted form or JSON string for form responses
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
