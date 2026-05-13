const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, maxlength: 150 },
  year:        { type: Number, required: true },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:      { type: String, enum: ['planning', 'active', 'finished'], default: 'planning' },
  level:       { type: String, enum: ['bronze', 'silver', 'gold'], default: null },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
