const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:        { type: String, required: true, maxlength: 150 },
  description: { type: String },
  location:    { type: String, maxlength: 200 },
  startDate:   { type: Date },
  endDate:     { type: Date },
  status:      { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  visibility:  { type: String, enum: ['public', 'private'], default: 'public' },
  areas:       [{ type: String }],
  resources:   { type: String },
  executionNotes: { type: String },
  executionLocation: { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
