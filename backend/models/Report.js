const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  report_id:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  content:    { type: DataTypes.JSON },
  generated_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'Reports', timestamps: true });

module.exports = Report;
