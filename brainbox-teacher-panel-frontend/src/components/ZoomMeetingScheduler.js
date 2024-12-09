import React, { useState } from 'react';
import axios from 'axios';
import './ZoomMeetingScheduler.css';

const ZoomMeetingScheduler = () => {
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const handleScheduleMeeting = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/zoom/create-meeting', {
        topic,
        start_time: startTime,
        duration: parseInt(duration),
      });

      console.log('Meeting created successfully:', response.data);
      setMeetingLink(response.data.join_url); // Set the meeting link
      setMessage('Meeting scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling meeting:', error.response?.data || error.message);
      setMessage('Failed to schedule meeting');
    }
  };

  return (
    <div className="zoom-meeting-page">
  <header className="zoom-meeting-header">
    <h2>Schedule a Zoom Meeting</h2>
  </header>

  <section className="zoom-meeting-form-section">
    <input
      type="text"
      className="meeting-topic-input"
      placeholder="Meeting Topic"
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
    />
    <input
      type="datetime-local"
      className="meeting-start-time-input"
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
    />
    <input
      type="number"
      className="meeting-duration-input"
      placeholder="Duration (minutes)"
      value={duration}
      onChange={(e) => setDuration(e.target.value)}
    />
    <button className="schedule-meeting-button" onClick={handleScheduleMeeting}>Schedule Meeting</button>
  </section>

  {message && <p className="zoom-meeting-message">{message}</p>}

  {meetingLink && (
    <section className="meeting-link-section">
      <p className="meeting-link-text">
        Meeting Link: 
        <a 
          href={meetingLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="meeting-link"
        >
          {meetingLink}
        </a>
      </p>
    </section>
  )}
</div>

  );
};

export default ZoomMeetingScheduler;
