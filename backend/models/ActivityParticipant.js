const mongoose = require('mongoose');

const activityParticipantSchema = new mongoose.Schema({
  activity:   { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestName:  { type: String },
  guestEmail: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ActivityParticipant', activityParticipantSchema);
