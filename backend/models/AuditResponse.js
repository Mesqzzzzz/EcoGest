const mongoose = require('mongoose');

const auditResponseSchema = new mongoose.Schema({
  project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  question:   { type: mongoose.Schema.Types.ObjectId, ref: 'AuditQuestion', required: true },
  value:      { type: String, required: true }, // Response value e.g. "Yes", "No", "50%" or numerical
  score:      { type: Number, default: 0 }, // 0 to 100 or 0 to 10 for quantification/treatment
  comments:   { type: String },
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('AuditResponse', auditResponseSchema);
