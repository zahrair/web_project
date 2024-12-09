import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ teacherName, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle the sidebar visibility
  };

  const handleLogout = () => {
    onLogout(); // Call the logout function passed from the parent component
    navigate('/login'); // Redirect to the login page
  };

  return (
    <>
      <nav className="navbar">
        {/* Menu Button */}
        <button className="menu-btn" onClick={toggleSidebar}>
          &#9776; Menu
        </button>

        {/* Logo Section */}
        <div className="logo">
          <img src={require('./images/brainboxlogo.png')} alt="App Logo" />
          <span>Brainbox</span>
        </div>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li><Link to="/" style={{ color: '#333333', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link></li>
          <li><Link to="/assignments">Assignment Management</Link></li>
          <li><Link to="/add-course">Add Course</Link></li>
          <li><Link to="/groups">Group Management</Link></li>
          <li><Link to="/schedule-meeting">Zoom Sessions</Link></li> {/* New Link */}
          <li>
          <Link to="/quizzes">Quizzes</Link> {/* New link for Quiz Management */}
         </li>
        </ul>

        {/* Display Teacher Name and Logout Button */}
        {teacherName && (
          <div className="user-info">
            <span>Welcome, {teacherName}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Brainbox</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            &times;
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
          <li><Link to="/">Home</Link></li>
            <li><Link to="/resources">Resource Management</Link></li>
            <li><Link to="/schedule-meeting">Study Sessions</Link></li>
            <li><Link to="/student-progress">Student Progress</Link></li>
            <li><Link to="/assignments">Assignments</Link></li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
