const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemLog = sequelize.define('SystemLog', {
  system_log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  level:         { type: DataTypes.ENUM('info', 'warn', 'error'), defaultValue: 'info' },
  message:       { type: DataTypes.TEXT },
  endpoint:      { type: DataTypes.STRING(255) },
  method:        { type: DataTypes.STRING(10) },
  status_code:   { type: DataTypes.INTEGER },
}, { tableName: 'System_Logs', timestamps: true, updatedAt: false });

module.exports = SystemLog;
