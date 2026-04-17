const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Backup = sequelize.define('Backup', {
  backup_id:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  file_name:  { type: DataTypes.STRING(200), allowNull: false },
  file_path:  { type: DataTypes.STRING(500), allowNull: false },
  size:       { type: DataTypes.STRING(50) },
  type:       { type: DataTypes.ENUM('manual', 'scheduled'), defaultValue: 'manual' },
  status:     { type: DataTypes.ENUM('completed', 'failed'), defaultValue: 'completed' },
  description:{ type: DataTypes.STRING(255) },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'Backups', timestamps: true });

module.exports = Backup;
