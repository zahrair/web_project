const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authenticateStudent = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET matches the token's secret
    const student = await Student.findById(decoded.student.id);

    if (!student) {
      return res.status(401).json({ msg: 'Authorization denied: Invalid student' });
    }

    req.student = student; // Add the student object to the request
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authenticateStudent;
