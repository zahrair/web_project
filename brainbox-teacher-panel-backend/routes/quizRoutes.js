const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const authenticateTeacher = require('../middleware/authenticateTeacher');
const authenticateStudent = require('../middleware/authenticateStudent');

// Create a Quiz
router.post('/create', authenticateTeacher, async (req, res) => {
  const { title, questions, startTime, endTime } = req.body;

  try {
    // Validate input data
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ msg: 'Title and questions are required.' });
    }
    if (!startTime || isNaN(new Date(startTime))) {
      return res.status(400).json({ msg: 'Valid start time is required.' });
    }
    if (!endTime || isNaN(new Date(endTime))) {
      return res.status(400).json({ msg: 'Valid end time is required.' });
    }

    const newQuiz = new Quiz({
      title,
      questions,
      createdBy: req.teacher.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    await newQuiz.save();
    res.status(201).json({ msg: 'Quiz created successfully', quiz: newQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fetch All Quizzes
router.get('/', authenticateTeacher, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'fullName');
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error.message);
    res.status(500).json({ msg: 'Failed to fetch quizzes' });
  }
});

// Submit Quiz
// Submit Quiz (Updated)
router.post('/:id/submit', authenticateStudent, async (req, res) => {
  console.log('Quiz Submission Request:', req.body);
  console.log('Quiz ID:', req.params.id);

  const { id } = req.params; // Quiz ID
  const { answeredQuestions } = req.body;

  try {
    const quiz = await Quiz.findById(id);

    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    if (new Date() > quiz.endTime) {
      return res.status(400).json({ msg: 'Quiz submission time has expired' });
    }

    const existingSubmission = quiz.submissions.find(
      (submission) => submission.student.toString() === req.student.id
    );

    if (existingSubmission) {
      return res.status(400).json({ msg: 'Quiz already submitted' });
    }

    let score = 0;

    answeredQuestions.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && question.correctOption === answer.selectedOption) {
        score++;
      }
    });

    quiz.submissions.push({
      student: req.student.id,
      score,
      answeredQuestions,
    });

    await quiz.save();

    const updatedQuiz = await Quiz.findById(id).populate('submissions.student', 'fullName');
    res.status(200).json({ msg: 'Quiz submitted successfully', score, updatedQuiz });
  } catch (error) {
    console.error('Error submitting quiz:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Auto Grade Unattempted Quizzes
router.post('/auto-grade', authenticateTeacher, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ endTime: { $lt: new Date() } });

    for (const quiz of quizzes) {
      const allStudents = await Student.find(); // Fetch all students
      const submittedStudents = quiz.submissions.map((s) => s.student.toString());

      const unsubmittedStudents = allStudents.filter(
        (student) => !submittedStudents.includes(student._id.toString())
      );

      unsubmittedStudents.forEach((student) => {
        quiz.submissions.push({
          student: student._id,
          score: 0,
        });
      });

      await quiz.save();
    }

    res.status(200).json({ msg: 'Auto grading completed' });
  } catch (error) {
    console.error('Error during auto-grading:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Quiz Results
router.get('/:id/results', authenticateTeacher, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('submissions.student', 'fullName')
      .populate('createdBy', 'fullName');

    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    const allStudents = await Student.find({}, 'fullName'); // Fetch all students
    const studentResults = allStudents.map((student) => {
      const submission = quiz.submissions.find(
        (sub) => sub.student?._id.toString() === student._id.toString()
      );
      return {
        studentId: student._id,
        fullName: student.fullName,
        score: submission ? submission.score : 0, // 0 for students who didn't attempt
      };
    });

    res.status(200).json({ quizTitle: quiz.title, results: studentResults });
  } catch (error) {
    console.error('Error fetching quiz results:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
