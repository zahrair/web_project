const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const authenticateTeacher = require('../middleware/authenticateTeacher');

// Get all students' progress
router.get('/progress', authenticateTeacher, async (req, res) => {
  try {
    // Fetch all students
    const students = await Student.find();

    // Calculate progress for each student
    const studentsWithPerformance = await Promise.all(
      students.map(async (student) => {
        
        // Count assignments completed by the student
        const assignmentsCompleted = await Assignment.countDocuments({
          'submissions.student': student._id, // Check if this student has a submission
          'submissions.status': 'Done' // Submission must have status 'Done'
        });

        // Count quizzes submitted by the student
        const quizzesCompleted = await Quiz.countDocuments({
          'submissions.student': student._id, // Check if this student has submitted a quiz
        });

        // Calculate the average feedback rating for this student
        const feedbacks = await Feedback.find({ student: student._id });
        const averageRating = feedbacks.length > 0
          ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length
          : 0;

        return {
          student: {
            _id: student._id,
            fullName: student.fullName,
            email: student.email,
          },
          assignmentsCompleted: assignmentsCompleted || 0, // Ensure 0 if no completed assignments found
          quizzesCompleted: quizzesCompleted || 0, // Ensure 0 if no quizzes are submitted
          averageRating: parseFloat(averageRating.toFixed(2)) // Round the average rating to 2 decimal places
        };
      })
    );

    res.status(200).json(studentsWithPerformance);
  } catch (error) {
    console.error('Error fetching student progress:', error.message);
    res.status(500).json({ msg: 'Failed to fetch student progress' });
  }
});

module.exports = router;
