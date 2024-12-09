const Assignment = require('../models/Assignment'); // Import Assignment model
const Quiz = require('../models/Quiz'); // Import Quiz model
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Student = require('../models/Student');
const authenticateTeacher = require('../middleware/authenticateTeacher');

// Create feedback
router.post('/add', authenticateTeacher, async (req, res) => {
    const { studentId, assignmentId, rating, comment } = req.body;
  
    try {
      // Check for existing feedback
      const existingFeedback = await Feedback.findOne({
        student: studentId,
        assignment: assignmentId || null, // Assignment is optional
      });
  
      if (existingFeedback) {
        // Update existing feedback
        existingFeedback.rating = rating;
        existingFeedback.comment = comment;
        await existingFeedback.save();
        return res.status(200).json({ msg: 'Feedback updated successfully', feedback: existingFeedback });
      }
  
      // Create new feedback
      const feedback = new Feedback({
        student: studentId,
        assignment: assignmentId || null,
        rating,
        comment,
        teacher: req.teacher._id, // Add teacher ID from middleware
      });
  
      await feedback.save();
      res.status(201).json({ msg: 'Feedback added successfully', feedback });
    } catch (error) {
      console.error('Error adding/updating feedback:', error.message);
      res.status(500).json({ msg: 'Failed to add/update feedback' });
    }
  });
  

// Get all feedback
router.get('/all', authenticateTeacher, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('student', 'fullName')
      .populate('assignment', 'title')
      .populate('teacher', 'fullName');
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit feedback
router.put('/:id', authenticateTeacher, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }

    feedback.rating = rating || feedback.rating;
    feedback.comment = comment || feedback.comment;

    await feedback.save();
    res.status(200).json({ msg: 'Feedback updated successfully', feedback });
  } catch (error) {
    console.error('Error updating feedback:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete feedback
router.delete('/:id', authenticateTeacher, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }
    res.status(200).json({ msg: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get top 3 rated students
router.get('/top-rated', authenticateTeacher, async (req, res) => {
  try {
    const topRatedStudents = await Feedback.aggregate([
      {
        $group: {
          _id: '$student', 
          averageRating: { $avg: '$rating' }, 
        },
      },
      {
        $sort: { averageRating: -1 }, 
      },
      {
        $limit: 3, 
      },
      {
        $lookup: {
          from: 'students', 
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $project: {
          _id: 0,
          student: { fullName: 1, email: 1 }, 
          averageRating: 1,
        },
      },
    ]);

    const studentsWithPerformance = await Promise.all(
      topRatedStudents.map(async (student) => {
        const assignmentsCompleted = await Assignment.countDocuments({ student: student.student._id, status: 'completed' });
        const quizzesCompleted = await Quiz.countDocuments({ student: student.student._id, status: 'completed' });

        return {
          student: student.student,
          averageRating: student.averageRating,
          assignmentsCompleted,
          quizzesCompleted,
        };
      })
    );

    res.json(studentsWithPerformance);
  } catch (error) {
    console.error('Error fetching top-rated students:', error.message);
    res.status(500).json({ msg: 'Failed to fetch top-rated students' });
  }
});
  

module.exports = router;
