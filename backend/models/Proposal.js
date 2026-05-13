const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  area:        { type: String },
  startDate:   { type: Date },
  endDate:     { type: Date },
  resources:   { type: String },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewNote:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
