const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  fileName:    { type: String, required: true },
  filePath:    { type: String },
  size:        { type: String },
  description: { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Backup', backupSchema);
