const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

module.exports = mongoose.model('Group', groupSchema);
