const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  date:        { type: Date, required: true },
  description: { type: String },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  deletedAt:   { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
