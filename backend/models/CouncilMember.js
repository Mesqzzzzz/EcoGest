const mongoose = require('mongoose');

const councilMemberSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  role:    { type: String, default: 'member' },
}, { timestamps: true });

module.exports = mongoose.model('CouncilMember', councilMemberSchema);
