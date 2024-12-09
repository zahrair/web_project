import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackManagement.css';

const FeedbackManagement = () => {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    assignmentId: '',
    rating: 1,
    comment: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
    fetchFeedbacks();
    fetchTopStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups/students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error.message);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/assignments/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error.message);
    }
  };

  const fetchTopStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/top-rated', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTopStudents(response.data);
    } catch (error) {
      console.error('Error fetching top students:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/feedback/add', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Feedback added successfully!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error adding feedback:', error.message);
      setMessage('Failed to add feedback');
    }
  };

  return (
    <div className="feedback-management">
    <header className="feedback-management-header">
      <h2>Feedback Management</h2>
      {message && <p className="feedback-management-message">{message}</p>}
    </header>
  
    <section className="add-feedback-section">
      <h3>Add Feedback</h3>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <select
          className="feedback-select-student"
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          required
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.fullName}
            </option>
          ))}
        </select>
        <select
          className="feedback-select-assignment"
          value={formData.assignmentId}
          onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
        >
          <option value="">Select Assignment (Optional)</option>
          {assignments.map((assignment) => (
            <option key={assignment._id} value={assignment._id}>
              {assignment.title}
            </option>
          ))}
        </select>
        <input
          className="feedback-input-rating"
          type="number"
          min="1"
          max="5"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          required
        />
        <textarea
          className="feedback-textarea-comment"
          placeholder="Comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          required
        ></textarea>
        <button type="submit" className="feedback-submit-button">Add Feedback</button>
      </form>
    </section>
  
    <section className="all-feedback-section">
      <h3>All Feedback</h3>
      <ul className="feedback-list">
        {feedbacks.map((feedback) => (
          <li key={feedback._id} className="feedback-item">
            <h4 className="feedback-student-name">{feedback.student.fullName}</h4>
            <p className="feedback-rating">Rating: {feedback.rating}</p>
            <p className="feedback-comment">Comment: {feedback.comment}</p>
            {feedback.assignment && (
              <p className="feedback-assignment">
                Assignment: {feedback.assignment.title}
              </p>
            )}
            <button
              className="feedback-delete-button"
              onClick={() =>
                axios
                  .delete(`http://localhost:5000/api/feedback/${feedback._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                  })
                  .then(fetchFeedbacks)
              }
            >
              Delete Feedback
            </button>
          </li>
        ))}
      </ul>
    </section>
  
    <section className="top-rated-students-section">
      <h3>Top Rated Students</h3>
      <ul className="top-rated-students-list">
        {topStudents.map((student) => (
          <li key={student.student._id} className="top-rated-student-item">
            {student.student.fullName}: Average Rating {student.averageRating.toFixed(2)}
          </li>
        ))}
      </ul>
    </section>
  </div>
  
  );
};

export default FeedbackManagement;
