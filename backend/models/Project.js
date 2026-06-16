const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de Projetos Ambientais/Ecológicos (EcoGest)
const projectSchema = new mongoose.Schema({
  // Nome único do projeto (limite de 150 caracteres)
  name:        { type: String, required: true, maxlength: 150 },
  // Ano de vigência ou ano de referência do projeto
  year:        { type: Number, required: true },
  // Referência ao utilizador coordenador responsável pelo projeto
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Estado atual do projeto: em planeamento, ativo ou finalizado
  status:      { type: String, enum: ['planning', 'active', 'finished'], default: 'planning' },
  // Nível ou galardão obtido no projeto (ex: bronze, prata, ouro)
  level:       { type: String, enum: ['bronze', 'silver', 'gold'], default: null },
}, { timestamps: true }); // Ativa criação automática dos timestamps createdAt e updatedAt

module.exports = mongoose.model('Project', projectSchema); // Exporta o modelo com o nome 'Project'
