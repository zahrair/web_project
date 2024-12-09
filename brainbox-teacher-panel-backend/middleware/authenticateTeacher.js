const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const authenticateTeacher = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.teacher.id);

    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    req.teacher = teacher; // Attach teacher object to request
    next();
  } catch (err) {
    console.error('Error verifying token:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authenticateTeacher;
