const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Participations – can be registered users OR guests (no user_id)
const ActivityParticipant = sequelize.define('ActivityParticipant', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  activity_id:   { type: DataTypes.INTEGER, allowNull: false },
  user_id:       { type: DataTypes.INTEGER, allowNull: true },   // null = guest
  guest_name:    { type: DataTypes.STRING(100), allowNull: true },
  guest_email:   { type: DataTypes.STRING(150), allowNull: true },
  joined_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'Activity_Participants', timestamps: false });

module.exports = ActivityParticipant;
