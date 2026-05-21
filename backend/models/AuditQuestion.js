const mongoose = require('mongoose');

const auditQuestionSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g. Water, Energy, Waste, Food, Transport
  code:     { type: String, required: true, unique: true }, // e.g. W1, E3
  text:     { type: String, required: true },
  options:  [{ type: String }], // Optional for multiple choice, e.g. ["Yes", "No", "Partial"]
}, { timestamps: true });

module.exports = mongoose.model('AuditQuestion', auditQuestionSchema);
