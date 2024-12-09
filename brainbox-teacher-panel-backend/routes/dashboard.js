const express = require('express');
const router = express.Router();

// Import your database models
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Feedback = require('../models/Feedback'); // Import Feedback model

// Route to fetch dashboard data
router.get('/dashboard-data', async (req, res) => {
  try {
    // Count total students, assignments, and courses
    const totalStudents = await Student.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalCourses = await Course.countDocuments();

    // Calculate average rating across all feedback
    const averageRatingData = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    const averageRating = averageRatingData.length > 0 ? averageRatingData[0].avgRating : 0;

    // Fetch top 4 rated students
    const topRatedStudents = await Feedback.aggregate([
      {
        $group: {
          _id: '$student',
          averageRating: { $avg: '$rating' },
        },
      },
      {
        $lookup: {
          from: 'students', // The name of the Student collection in MongoDB
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student', // Flatten the student array
      },
      {
        $sort: { averageRating: -1 }, // Sort by highest average rating
      },
      {
        $limit: 4, // Limit to top 4 students
      },
      {
        $project: {
          _id: '$student._id',
          fullName: '$student.fullName',
          averageRating: 1,
        },
      },
    ]);

    // Respond with all dashboard data
    res.json({
      totalStudents,
      totalAssignments,
      totalCourses,
      averageRating: averageRating.toFixed(2), // Return a fixed decimal rating
      topRatedStudents,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    res.status(500).json({ msg: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
