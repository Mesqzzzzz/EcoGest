const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level:    { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  message:  { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('SystemLog', systemLogSchema);
