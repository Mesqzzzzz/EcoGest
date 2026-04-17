const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CouncilMember = sequelize.define('CouncilMember', {
  member_id:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'Council_Members', timestamps: true });

module.exports = CouncilMember;
