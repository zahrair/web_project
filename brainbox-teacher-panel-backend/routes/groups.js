const express = require('express');
const Group = require('../models/Group'); // Group schema
const Student = require('../models/Student'); // Student schema
const authenticateTeacher = require('../middleware/authenticateTeacher');
const router = express.Router();

// Fetch all students
router.get('/students', authenticateTeacher, async (req, res) => {
  try {
    const students = await Student.find().select('fullName email group');
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fetch all groups
router.get('/all', authenticateTeacher, async (req, res) => {
  try {
    const groups = await Group.find().populate('students', 'fullName email');
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new group
router.post('/create', authenticateTeacher, async (req, res) => {
    const { name, students } = req.body;
    try {
      // Check if the group name already exists
      const groupExists = await Group.findOne({ name });
      if (groupExists) {
        return res.status(400).json({ msg: 'Group name already exists' });
      }
  
      // Check if any student is already in another group
      const existingGroupStudents = await Student.find({ _id: { $in: students }, group: { $ne: null } });
      if (existingGroupStudents.length > 0) {
        const studentNames = existingGroupStudents.map((student) => student.fullName).join(', ');
        return res.status(400).json({
          msg: `The following students are already in another group: ${studentNames}`,
        });
      }
  
      // Create the group
      const group = new Group({ name, students });
      await group.save();
  
      // Update the students to reference this group
      await Student.updateMany(
        { _id: { $in: students } },
        { group: group._id }
      );
  
      res.status(201).json({ msg: 'Group created successfully', group });
    } catch (error) {
      console.error('Error creating group:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  

// Delete a group
router.delete('/:id', authenticateTeacher, async (req, res) => {
  try {
    const groupId = req.params.id;

    await Group.findByIdAndDelete(groupId);

    await Student.updateMany({ group: groupId }, { group: null });

    res.status(200).json({ msg: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
