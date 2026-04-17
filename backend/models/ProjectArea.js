const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectArea = sequelize.define('ProjectArea', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  area:       { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'Project_Areas', timestamps: false });

module.exports = ProjectArea;
