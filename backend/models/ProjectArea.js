const mongoose = require('mongoose');

const projectAreaSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  area:    { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('ProjectArea', projectAreaSchema);
