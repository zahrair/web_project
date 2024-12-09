import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupManagement.css';

const GroupManagement = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error.message);
      setMessage('Failed to fetch students.');
    }
  };

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
      setMessage('Failed to fetch groups.');
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/groups/create',
        { name: newGroupName, students: selectedStudents },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage('Group created successfully!');
      fetchGroups();
      setNewGroupName('');
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error creating group:', error.message);
      if (error.response && error.response.data.msg) {
        setMessage(error.response.data.msg); // Display error message from the backend
      } else {
        setMessage('Failed to create group.');
      }
    }
  };
  

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`http://localhost:5000/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('Group deleted successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error.message);
      setMessage('Failed to delete group.');
    }
  };

  return (
    <div className="group-management">
    <header className="group-management-header">
      <h2>Group Management</h2>
      {message && <p className="group-management-message">{message}</p>}
    </header>
  
    <section className="create-group-section">
      <h3>Create New Group</h3>
      <div className="create-group-form">
        <input
          type="text"
          className="group-name-input"
          placeholder="Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <select
          multiple
          className="students-select"
          value={selectedStudents}
          onChange={(e) =>
            setSelectedStudents([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.fullName}
            </option>
          ))}
        </select>
        <button className="create-group-button" onClick={handleCreateGroup}>
          Create Group
        </button>
      </div>
    </section>
  
    <section className="group-list-section">
      <h3>Existing Groups</h3>
      <div className="group-list">
        {groups.map((group) => (
          <div key={group._id} className="group-card">
            <h4 className="group-name">{group.name}</h4>
            <ul className="group-members-list">
              {group.students.map((student) => (
                <li key={student._id} className="group-member-item">
                  {student.fullName}
                </li>
              ))}
            </ul>
            <button
              className="delete-group-button"
              onClick={() => handleDeleteGroup(group._id)}
            >
              Delete Group
            </button>
          </div>
        ))}
      </div>
    </section>
  </div>
  
  );
};

export default GroupManagement;
