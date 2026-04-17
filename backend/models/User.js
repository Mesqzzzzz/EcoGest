const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  status:   { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  role:     { type: DataTypes.ENUM('admin', 'coordinator', 'secretary', 'council_member', 'user'), defaultValue: 'user' },
}, { tableName: 'Users', timestamps: true });

module.exports = User;
