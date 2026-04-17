const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  activity_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id:  { type: DataTypes.INTEGER, allowNull: false },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  location:    { type: DataTypes.STRING(200) },
  start_date:  { type: DataTypes.DATEONLY },
  end_date:    { type: DataTypes.DATEONLY },
  status:      { type: DataTypes.ENUM('planned', 'active', 'completed'), defaultValue: 'planned' },
  visibility:  { type: DataTypes.ENUM('public', 'private'), defaultValue: 'public' },
  created_by:  { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'Activities', timestamps: true });

module.exports = Activity;
