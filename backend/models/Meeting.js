const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de reuniões de acompanhamento dos projetos ecológicos
const meetingSchema = new mongoose.Schema({
  // Nome ou assunto principal da reunião (ex: "Discussão de Auditoria Q2")
  name:        { type: String, required: true },
  // Data e hora de agendamento da reunião
  date:        { type: Date, required: true },
  // Descrição do propósito ou pontos da agenda da reunião
  description: { type: String },
  // Referência ao Projeto sobre o qual a reunião vai versar
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Campo de eliminação lógica (soft delete) para guardar a data de remoção caso seja apagada
  deletedAt:   { type: Date, default: null },
}, { timestamps: true }); // Adiciona campos de data de criação e atualização

module.exports = mongoose.model('Meeting', meetingSchema); // Exporta o modelo com o nome 'Meeting'
