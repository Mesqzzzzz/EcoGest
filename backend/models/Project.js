const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  project_id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:           { type: DataTypes.STRING(150), allowNull: false },
  year:           { type: DataTypes.INTEGER, allowNull: false },
  coordinator_id: { type: DataTypes.INTEGER, allowNull: true },
  status:         { type: DataTypes.ENUM('planning', 'active', 'finished'), defaultValue: 'planning' },
  level_id:       { type: DataTypes.ENUM('bronze', 'silver', 'gold'), allowNull: true },
}, { tableName: 'Projects', timestamps: true });

module.exports = Project;
