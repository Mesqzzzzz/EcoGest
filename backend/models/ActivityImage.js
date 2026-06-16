const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema do modelo de Imagens de Atividades
const activityImageSchema = new mongoose.Schema({
  // Referência à atividade correspondente na qual a foto foi tirada
  activity:   { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  // Caminho/URL de acesso à imagem carregada
  imageUrl:   { type: String, required: true },
  // Referência ao utilizador que carregou o ficheiro de imagem
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true }); // Adiciona as propriedades createdAt e updatedAt geridas automaticamente

module.exports = mongoose.model('ActivityImage', activityImageSchema); // Exporta o modelo com o nome 'ActivityImage'
