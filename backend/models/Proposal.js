const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Proposals submitted by council members, reviewed by coordinators
const Proposal = sequelize.define('Proposal', {
  proposal_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id:  { type: DataTypes.INTEGER, allowNull: false },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  area:        { type: DataTypes.STRING(100) },
  start_date:  { type: DataTypes.DATEONLY },
  end_date:    { type: DataTypes.DATEONLY },
  resources:   { type: DataTypes.TEXT },
  status:      { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  created_by:  { type: DataTypes.INTEGER, allowNull: false },
  reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
  review_note: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'Proposals', timestamps: true });

module.exports = Proposal;
