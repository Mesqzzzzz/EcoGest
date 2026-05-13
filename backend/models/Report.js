const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  filePath:    { type: String },
  notes:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
