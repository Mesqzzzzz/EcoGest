const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema da tabela de ligação de áreas geográficas ou temáticas ao projeto
const projectAreaSchema = new mongoose.Schema({
  // Referência ao Projeto que abrange esta área temática
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Nome da área temática ou geográfica (ex: "Jardins", "Cantina")
  area:    { type: String, required: true },
}, { timestamps: false }); // Desativa timestamps automáticos uma vez que é uma tabela de associação simples

module.exports = mongoose.model('ProjectArea', projectAreaSchema); // Exporta o modelo com o nome 'ProjectArea'
