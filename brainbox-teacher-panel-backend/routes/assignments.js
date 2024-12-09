const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Group = require('../models/Group');
const authenticateTeacher = require('../middleware/authenticateTeacher');
const authenticateStudent = require('../middleware/authenticateStudent');

// Create a new assignment
router.post('/create', authenticateTeacher, async (req, res) => {
  try {
    const { title, description, difficulty, dueDate, groupId } = req.body;

    // Check if the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Create assignment
    const assignment = new Assignment({
      title,
      description,
      difficulty,
      dueDate,
      group: groupId,
      createdBy: req.teacher._id,
    });

    await assignment.save();
    res.status(201).json({ msg: 'Assignment created successfully', assignment });
  } catch (error) {
    console.error('Error creating assignment:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get assignments for a specific group
router.get('/group/:groupId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ group: req.params.groupId }).populate('submissions.student', 'fullName');
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
router.get('/all', authenticateTeacher, async (req, res) => {
    try {
      const assignments = await Assignment.find().populate('group', 'name');
      res.status(200).json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
      res.status(500).json({ msg: 'Failed to fetch assignments' });
    }
  });
  // Fetch "Not Done" Assignments for a Student
router.get('/not-done', authenticateStudent, async (req, res) => {
    try {
      const { group } = req.student;
  
      // Ensure the student belongs to a group
      if (!group) {
        return res.status(400).json({ msg: 'You are not part of any group.' });
      }
  
      const assignments = await Assignment.find({ group }).populate('submissions.student');
  
      // Filter assignments where the current student has not submitted or status is "Not Done"
      const notDoneAssignments = assignments.filter((assignment) =>
        !assignment.submissions.some(
          (submission) => submission.student.toString() === req.student.id && submission.status === 'Done'
        )
      );
  
      res.status(200).json(notDoneAssignments);
    } catch (error) {
      console.error('Error fetching not done assignments:', error.message);
      res.status(500).json({ msg: 'Failed to fetch assignments' });
    }
  });
  
// Mark Assignment as Completed
router.post('/mark-completed', authenticateStudent, async (req, res) => {
    try {
      const { assignmentId } = req.body;
  
      // Ensure the student is part of the group to which the assignment belongs
      const assignment = await Assignment.findById(assignmentId).populate({
        path: 'group',
        populate: { path: 'students' },
      });
  
      if (!assignment) {
        return res.status(404).json({ msg: 'Assignment not found' });
      }
  
      const studentId = req.student._id;
  
      // Check if the student belongs to the assignment's group
      if (!assignment.group.students.some((student) => student._id.toString() === studentId.toString())) {
        return res.status(403).json({ msg: 'You are not part of the group for this assignment' });
      }
  
      // Add student to the completed list if not already done
      if (!assignment.submissions.some((submission) => submission.student.toString() === studentId.toString())) {
        assignment.submissions.push({
          student: studentId,
          status: 'Done',
          submittedForm: '', // Adjust as needed
        });
        await assignment.save();
      }
  
      res.status(200).json({ msg: 'Assignment marked as completed' });
    } catch (error) {
      console.error('Error marking assignment as completed:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  router.delete('/:id', authenticateTeacher, async (req, res) => {
    try {
      const assignment = await Assignment.findByIdAndDelete(req.params.id);
      if (!assignment) {
        return res.status(404).json({ msg: 'Assignment not found' });
      }
      res.status(200).json({ msg: 'Assignment deleted successfully' });
    } catch (error) {
      console.error('Error deleting assignment:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  
module.exports = router;
