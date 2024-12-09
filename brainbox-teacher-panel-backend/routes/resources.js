const express = require('express');
const multer = require('multer');
const path = require('path');
const Resource = require('../models/Resource');
const authenticateTeacher = require('../middleware/authenticateTeacher');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// **POST: Add a new resource**
router.post('/add', authenticateTeacher, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, topic, difficulty, tags } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const uploadedBy = req.teacher._id;

    const resource = new Resource({
      title,
      description,
      fileUrl,
      uploadedBy,
      subject,
      topic,
      difficulty,
      tags: tags.split(',').map(tag => tag.trim()), // Convert tags from string to array
    });

    await resource.save();
    res.status(201).json({ msg: 'Resource added successfully', resource });
  } catch (error) {
    console.error('Error adding resource:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// **GET: Get all resources with filtering**
router.get('/all', authenticateTeacher, async (req, res) => {
  try {
    const { difficulty, topic, tags } = req.query;

    let filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (tags) filter.tags = { $in: tags.split(',') };

    const resources = await Resource.find(filter).populate('uploadedBy', 'fullName');
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
// **DELETE: Delete a resource by ID**
router.delete('/delete/:id', authenticateTeacher, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    // Check if the teacher is the uploader
    if (resource.uploadedBy.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();
    res.status(200).json({ msg: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
// **PUT: Update a resource by ID**
router.put('/update/:id', authenticateTeacher, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { title, description, subject, topic, difficulty, tags } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    // Check if the teacher is the uploader
    if (resource.uploadedBy.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this resource' });
    }

    resource.title = title || resource.title;
    resource.description = description || resource.description;
    resource.subject = subject || resource.subject;
    resource.topic = topic || resource.topic;
    resource.difficulty = difficulty || resource.difficulty;
    resource.tags = tags ? tags.split(',').map(tag => tag.trim()) : resource.tags;

    await resource.save();
    res.status(200).json({ msg: 'Resource updated successfully', resource });
  } catch (error) {
    console.error('Error updating resource:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
