const mongoose = require('mongoose');

const meetingDocumentSchema = new mongoose.Schema({
  meeting:     { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  name:        { type: String, required: true },
  documentUrl: { type: String },
  type:        { type: String, enum: ['agenda', 'minutes', 'other'], default: 'other' },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('MeetingDocument', meetingDocumentSchema);
