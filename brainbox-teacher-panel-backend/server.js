// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Use Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard'); // Add this
const courseRoutes = require('./routes/courses');
const resourceRoutes = require('./routes/resources');
const groupRoutes = require('./routes/groups');
const assignmentRoutes = require('./routes/assignments'); // Assignment management routes
const feedbackRoutes = require('./routes/feedback');
const quizRoutes = require('./routes/quizRoutes'); // Import quiz routes
const zoomRoutes = require('./routes/zoomRoutes');
const progressRoutes = require('./routes/progressRoutes');
app.use('/api/progress', progressRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/quizzes', quizRoutes); // Add quiz routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes); // Add this
app.use('/api/assignments', assignmentRoutes); // Add the assignments API route

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/dashboard', (req, res) => {
  res.json({ message: 'Welcome to Brainbox Teacher Dashboard' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
