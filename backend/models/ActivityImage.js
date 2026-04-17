const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityImage = sequelize.define('ActivityImage', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url:   { type: DataTypes.STRING(500), allowNull: false },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'Activity_Images', timestamps: true });

module.exports = ActivityImage;
