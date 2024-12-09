import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompletedAssignments.css';

const CompletedAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompletedAssignments();
  }, []);

  const fetchCompletedAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/assignments/group/completed', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching completed assignments:', error.message);
      setMessage('Failed to fetch completed assignments');
    }
  };

  return (
    <div className="completed-assignments">
      <h2>Completed Assignments</h2>
      {message && <p>{message}</p>}
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment._id}>
            <h4>{assignment.title}</h4>
            <p>{assignment.description}</p>
            <p>Group: {assignment.group.name}</p>
            <ul>
              {assignment.submissions.map((submission) => (
                <li key={submission.student._id}>
                  {submission.student.fullName} - {submission.status}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompletedAssignments;
