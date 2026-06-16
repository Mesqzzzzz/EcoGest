const { DataTypes } = require('sequelize'); // Importa DataTypes da framework ORM Sequelize
const sequelize = require('../config/database'); // Importa a instância de configuração da base de dados (Sequelize)

// Define a estrutura do modelo ActivityArea usando Sequelize
const ActivityArea = sequelize.define('ActivityArea', {
  // Identificador único sequencial da área
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  // ID associado à atividade relacionada
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  // Nome da área ambiental correspondente (máximo 100 caracteres)
  area:        { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'Activity_Areas', timestamps: false }); // Define o nome da tabela física e desativa criação automática de timestamps

module.exports = ActivityArea; // Exporta o modelo ActivityArea
