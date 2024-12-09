
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student'); // Import Student model

// Student Login Route
router.post('/slogin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    // Check if the student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { student: { id: student._id } }, // Embed student ID in the token
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Respond with the token
    res.json({ token, studentId: student._id, group: student.group }); // Include additional details if needed
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
// Register a new user (Teacher or Student)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if role is provided and valid
    if (!role || !['Teacher', 'Student'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role. Must be Teacher or Student.' });
    }

    // Check if the user already exists
    const UserModel = role === 'Teacher' ? Teacher : Student;
    let user = await UserModel.findOne({ email });
    if (user) {
      console.error(`${role} already exists:`, email);
      return res.status(400).json({ msg: `${role} already exists` });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);

    // Save the user
    user = new UserModel({
      fullName: name,
      email,
      passwordHash: hashedPassword,
      role,
      isApproved: role === 'Teacher' ? false : true, // Teachers need admin approval; students are approved by default
    });

    await user.save();
    console.log(`${role} saved:`, user);

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, name: user.fullName });
      }
    );
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login a teacher
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    // Check if the teacher exists
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      console.error('Teacher not found for email:', email);
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // Compare the password
    if (!teacher.passwordHash) {
      console.error('Password hash is missing for email:', email);
      return res.status(500).json({ msg: 'Server error: Password hash is undefined' });
    }

    const isMatch = await bcrypt.compare(password, teacher.passwordHash);
    if (!isMatch) {
      console.error('Password does not match for email:', email);
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // Check if the account is approved
    if (!teacher.isApproved) {
      console.error('Account not approved for email:', email);
      return res.status(403).json({ msg: 'Account not approved by admin' });
    }

    // Generate JWT token
    const payload = {
      teacher: {
        id: teacher.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, name: teacher.fullName });
      }
    );
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
