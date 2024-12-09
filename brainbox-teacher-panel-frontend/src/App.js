import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // Navbar at the top
import DashboardBody from './components/DashboardBody';
import Login from './components/Login'; // Login component
import AddCourse from './components/AddCourse';
import ResourcePage from './components/ResourcePage'; // Resource page component
import ProtectedRoute from './components/ProtectedRoute'; // Protected Route wrapper for private routes
import GroupManagement from './components/GroupManagement'; // Group Management page
import AssignmentManagement from './components/AssignmentManagement'; // Assignment management component
import FeedbackManagement from './components/FeedbackManagement';
import QuizManagement from './components/QuizManagement';
import QuizResultsPage from './components/QuizResultsPage';
import ZoomMeetingScheduler from './components/ZoomMeetingScheduler';
import StudentProgress from './components/StudentProgress';

const App = () => {
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    // Fetch teacher name from localStorage
    const storedName = localStorage.getItem('teacherName');
    if (storedName) {
      setTeacherName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored data, including token and teacherName
    setTeacherName('');
  };

  return (
    <Router>
      <Navbar teacherName={teacherName} onLogout={handleLogout} />
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<Login setTeacherName={setTeacherName} />} />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardBody teacherName={teacherName} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourcePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-course"
          element={
            <ProtectedRoute>
              <AddCourse teacherId={localStorage.getItem('teacherId')} />
            </ProtectedRoute>
          }
        />
         <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupManagement />
            </ProtectedRoute>
          }
        />
         <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <AssignmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
  path="/feedback"
  element={
    <ProtectedRoute>
      <FeedbackManagement />
    </ProtectedRoute>
  }
/>

<Route path="/quizzes" element={<ProtectedRoute><QuizManagement /></ProtectedRoute>} />
<Route path="/quizzes/:quizId/results" element={<QuizResultsPage />} />

        <Route path="/sessions" element={<h1>Study Sessions</h1>} />
        <Route path="/student-progress" element={<StudentProgress />} />
        <Route path="/schedule-meeting" element={<ZoomMeetingScheduler />} />
              <Route path="/assignments" element={<h1>Assignment Management</h1>} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to={teacherName ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App; 