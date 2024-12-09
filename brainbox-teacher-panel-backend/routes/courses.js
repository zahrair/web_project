const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authenticateTeacher = require('../middleware/authenticateTeacher');

// Add a new course
router.post('/add', authenticateTeacher, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Create the course using the authenticated teacher's ID
    const newCourse = new Course({
      title,
      description,
      instructor: req.teacher._id, // Get teacher ID from the middleware
    });

    await newCourse.save();
    res.status(201).json({ msg: 'Course added successfully', course: newCourse });
  } catch (error) {
    console.error('Error adding course:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
// Get all courses for the logged-in teacher
router.get('/my-courses', authenticateTeacher, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.teacher._id });
    if (courses.length === 0) {
      return res.status(404).json({ msg: 'No courses found for this teacher' });
    }
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
