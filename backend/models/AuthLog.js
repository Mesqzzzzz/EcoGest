const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthLog = sequelize.define('AuthLog', {
  auth_log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: true },
  action:      { type: DataTypes.ENUM('login', 'logout', 'register', 'failed_login'), allowNull: false },
  success:     { type: DataTypes.BOOLEAN, defaultValue: false },
  ip_address:  { type: DataTypes.STRING(50) },
  device_info: { type: DataTypes.STRING(255) },
}, { tableName: 'Auth_Logs', timestamps: true, updatedAt: false });

module.exports = AuthLog;
