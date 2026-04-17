const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityArea = sequelize.define('ActivityArea', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  area:        { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'Activity_Areas', timestamps: false });

module.exports = ActivityArea;
