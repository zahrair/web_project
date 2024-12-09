const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctOption: { type: Number, required: true }, // Index of the correct option
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      score: { type: Number, default: 0 },
      answeredQuestions: [
        {
          questionIndex: { type: Number, required: true },
          selectedOption: { type: Number, required: true },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Quiz', QuizSchema);
