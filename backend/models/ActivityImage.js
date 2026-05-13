const mongoose = require('mongoose');

const activityImageSchema = new mongoose.Schema({
  activity:   { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  imageUrl:   { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('ActivityImage', activityImageSchema);
