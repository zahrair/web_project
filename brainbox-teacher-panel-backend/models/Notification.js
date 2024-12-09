const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'], // Can be customized
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false, // By default, the notification is unread
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
