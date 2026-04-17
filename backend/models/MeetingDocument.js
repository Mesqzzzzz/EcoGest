const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeetingDocument = sequelize.define('MeetingDocument', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  meeting_id:   { type: DataTypes.INTEGER, allowNull: false },
  name:         { type: DataTypes.STRING(200), allowNull: false },
  document_url: { type: DataTypes.STRING(500), allowNull: false },
  type:         { type: DataTypes.ENUM('minutes', 'report', 'other'), defaultValue: 'other' },
  uploaded_by:  { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'Meetings_Documents', timestamps: true });

module.exports = MeetingDocument;
