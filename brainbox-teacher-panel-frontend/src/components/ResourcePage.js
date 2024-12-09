import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourcePage.css';

const ResourcePage = () => {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty: 'Easy',
    tags: '',
  });
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({ difficulty: '', topic: '', tags: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resources/all', {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error.message);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleDelete = async (resourceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/resources/delete/${resourceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setResources(resources.filter(resource => resource._id !== resourceId));
      setMessage('Resource deleted successfully!');
    } catch (error) {
      console.error('Error deleting resource:', error.message);
      setMessage('Failed to delete resource');
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => formDataObj.append(key, formData[key]));
    formDataObj.append('file', file);
    try {
      const response = await axios.post('http://localhost:5000/api/resources/add', formDataObj, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setResources([...resources, response.data.resource]);
      setMessage('Resource uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resource:', error.message);
      setMessage('Failed to upload resource');
    }
  };

  return (
    <div className="resource-page">
  <header className="resource-page-header">
    <h2>Resource Management</h2>
    {message && <p className="resource-message">{message}</p>}
  </header>

  <section className="resource-upload-section">
    <h3>Upload New Resource</h3>
    <form className="resource-upload-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="resource-title-input"
        placeholder="Title"
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <textarea
        className="resource-description-input"
        placeholder="Description"
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      ></textarea>
      <input
        type="text"
        className="resource-subject-input"
        placeholder="Subject"
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
      />
      <input
        type="text"
        className="resource-topic-input"
        placeholder="Topic"
        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
      />

      <select
        className="resource-difficulty-select"
        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
      >
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      <input
        type="text"
        className="resource-tags-input"
        placeholder="Tags (comma separated)"
        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
      />
      <input
        type="file"
        className="resource-file-input"
        onChange={handleFileChange}
        required
      />
      <button type="submit" className="upload-button">Upload</button>
    </form>
  </section>

  <section className="resource-filter-section">
    <h3>Filter Resources</h3>
    <input
      type="text"
      className="filter-topic-input"
      placeholder="Topic"
      onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
    />
    <input
      type="text"
      className="filter-tags-input"
      placeholder="Tags"
      onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
    />
    <select
      className="filter-difficulty-select"
      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
    >
      <option value="">Select Difficulty</option>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
  </section>

  <section className="uploaded-resources-section">
    <h3>Uploaded Resources</h3>
    <ul className="uploaded-resources-list">
      {resources.map(resource => (
        <li key={resource._id} className="resource-item">
          <h4 className="resource-title">{resource.title} ({resource.difficulty})</h4>
          <p className="resource-tags">Tags: {resource.tags.join(', ')}</p>
          <a
            href={`http://localhost:5000${resource.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-file-link"
          >
            View File
          </a>
          <button onClick={() => handleDelete(resource._id)} className="delete-button">
          Delete
        </button>
        
        </li>
      ))}
    </ul>
  </section>
</div>

  );
};

export default ResourcePage;
