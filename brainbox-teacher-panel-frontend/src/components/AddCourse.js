import React, { useState } from 'react';
import axios from 'axios';
import './AddCourse.css';

const AddCourse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddCourse = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
  
    if (!token) {
      setErrorMessage('No token found. Please log in again.');
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/courses/add',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Example: Log the response or use it in the UI
      console.log('Course added:', response.data.course);
  
      setSuccessMessage('Course added successfully!');
      setTitle('');
      setDescription('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding course:', error.response?.data || error.message);
      setErrorMessage(error.response?.data?.msg || 'Failed to add course');
    }
  };
  
  return (
    <div className="add-course-container">
      <h2>Add a New Course</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleAddCourse}>
        <div>
          <label>Course Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Course Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Course</button>
      </form>
    </div>
  );
};

export default AddCourse;
