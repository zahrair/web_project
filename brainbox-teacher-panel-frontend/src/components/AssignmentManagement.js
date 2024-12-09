import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignmentManagement.css';

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [notDoneAssignments, setNotDoneAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    dueDate: '',
    groupId: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchAssignments();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error.message);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/assignments/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAssignments(response.data);

      setCompletedAssignments(
        response.data.filter((assignment) =>
          assignment.submissions.some((submission) => submission.status === 'Done')
        )
      );

      setNotDoneAssignments(
        response.data.filter(
          (assignment) =>
            !assignment.submissions.some((submission) => submission.status === 'Done')
        )
      );
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/assignments/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage('Assignment created successfully!');
      fetchAssignments(); // Refresh assignments
      setFormData({ title: '', description: '', difficulty: 'Easy', dueDate: '', groupId: '' });
    } catch (error) {
      console.error('Error creating assignment:', error.message);
      setMessage('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/assignments/${assignmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('Assignment deleted successfully!');
      fetchAssignments(); // Refresh assignments
    } catch (error) {
      console.error('Error deleting assignment:', error.message);
      setMessage('Failed to delete assignment');
    }
  };

  return (
    <div className="assignment-management">
    <header className="assignment-header">
      <h2>Assignment Management</h2>
      {message && <p className="assignment-message">{message}</p>}
    </header>

    <section className="assignment-form-section">
      <form className="assignment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        ></textarea>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />
        <select
          value={formData.groupId}
          onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
          required
        >
          <option value="">Select Group</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        <button type="submit" className="assignment-submit-btn">Create Assignment</button>
      </form>
    </section>

    <section className="assignments-section">
      <h3>All Assignments</h3>
      <ul className="assignments-list">
        {assignments.map((assignment) => (
          <li key={assignment._id} className="assignment-item">
            <h4>{assignment.title}</h4>
            <p>{assignment.description}</p>
            <p>Difficulty: {assignment.difficulty}</p>
            <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
            <p>Group: {assignment.group.name}</p>
            <button
              className="assignment-delete-btn"
              onClick={() => handleDeleteAssignment(assignment._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
    <section className="completed-assignments-section">
  <h3>Completed Assignments</h3>
  <ul className="completed-assignments-list">
    {completedAssignments.map((assignment) => (
      <li key={assignment._id} className="completed-assignment-item">
        <h4>{assignment.title}</h4>
        <p>{assignment.description}</p>
        <p>Difficulty: {assignment.difficulty}</p>
        <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        <p>Group: {assignment.group.name}</p>
        <ul className="completed-submissions-list">
          {assignment.submissions
            .filter((submission) => submission.status === 'Done')
            .map((submission) => (
              <li key={submission.student._id} className="submission-item">
                {submission.student.fullName}: {submission.status}
              </li>
            ))}
        </ul>
      </li>
    ))}
  </ul>
</section>
<section className="not-done-assignments-section">
  <h3>Not Done Assignments</h3>
  <ul className="not-done-assignments-list">
    {notDoneAssignments.map((assignment) => (
      <li key={assignment._id} className="not-done-assignment-item">
        <h4>{assignment.title}</h4>
        <p>{assignment.description}</p>
        <p>Difficulty: {assignment.difficulty}</p>
        <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        <p>Group: {assignment.group.name}</p>
      </li>
    ))}
  </ul>
</section>

  </div>
  );
};

export default AssignmentManagement;
