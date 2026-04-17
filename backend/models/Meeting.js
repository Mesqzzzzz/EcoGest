const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meeting = sequelize.define('Meeting', {
  meeting_id:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id:  { type: DataTypes.INTEGER, allowNull: false },
  name:        { type: DataTypes.STRING(200), allowNull: false },
  date:        { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT },
  deleted_at:  { type: DataTypes.DATE, allowNull: true }, // soft delete
}, { tableName: 'Meetings', timestamps: true });

module.exports = Meeting;
