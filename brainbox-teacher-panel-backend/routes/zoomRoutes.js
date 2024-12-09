const express = require('express');
const axios = require('axios');
const router = express.Router();
const Notification = require('../models/Notification'); // Import Notification schema

// Zoom API credentials
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;


// Helper to generate an access token
const generateAccessToken = async () => {
    try {
      const credentials = Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
      ).toString('base64');
  
      const response = await axios.post(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: process.env.ZOOM_ACCOUNT_ID,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      return response.data.access_token;
    } catch (error) {
      console.error('Error generating access token:', error.response?.data || error.message);
      throw new Error('Failed to generate access token');
    }
};
  
router.get('/token', async (req, res) => {
    try {
      const credentials = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');
  
      const response = await axios.post(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: process.env.ZOOM_ACCOUNT_ID,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      res.status(200).json({ access_token: response.data.access_token });
    } catch (error) {
      console.error('Error generating access token:', error.response?.data || error.message);
      res.status(500).json({
        msg: 'Failed to generate access token',
        error: error.response?.data || error.message,
      });
    }
  });
// Create a Zoom meeting
router.post('/create-meeting', async (req, res) => {
    try {
      const { topic, start_time, duration } = req.body;
  
      if (!topic || !start_time || !duration) {
        return res.status(400).json({ msg: 'All fields are required' });
      }
  
      const accessToken = await generateAccessToken();
  
      const meetingData = {
        topic,
        type: 2, // Scheduled meeting
        start_time, // ISO 8601 format (e.g., "2024-12-12T10:00:00Z")
        duration, // Duration in minutes
        settings: {
          host_video: true,
          participant_video: true,
        },
      };
  
      const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const newNotification = new Notification({
        message: `A new Zoom meeting has been scheduled: ${topic} at ${start_time}.`,
        type: 'info', // This can be 'info', 'success', 'warning', 'error'
      });
  
      await newNotification.save();
      
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Error creating meeting:', error.response?.data || error.message);
      res.status(500).json({ msg: 'Failed to create meeting' });
    }
  });


module.exports = router;
