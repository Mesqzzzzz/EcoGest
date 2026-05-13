const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action:     { type: String, required: true },
  success:    { type: Boolean, default: false },
  ipAddress:  { type: String },
  deviceInfo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuthLog', authLogSchema);
