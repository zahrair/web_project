import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setTeacherName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Store token and teacher details in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('teacherName', res.data.name);
      localStorage.setItem('teacherId', res.data.id); // Store the teacher's ID

      // Update teacher name in state
      setTeacherName(res.data.name);

      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Teacher Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
