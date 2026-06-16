const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para o registo de participantes (utilizadores registados ou convidados) em atividades
const activityParticipantSchema = new mongoose.Schema({
  // Referência à atividade à qual o participante está associado
  activity:   { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  // Referência ao utilizador do sistema (se autenticado), opcional caso seja participante externo/convidado
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Nome do participante convidado (utilizado apenas se 'user' for nulo)
  guestName:  { type: String },
  // Email do participante convidado (utilizado apenas se 'user' for nulo)
  guestEmail: { type: String },
}, { timestamps: true }); // Adiciona registos automáticos de tempos de criação e alteração

module.exports = mongoose.model('ActivityParticipant', activityParticipantSchema); // Exporta o modelo com o nome 'ActivityParticipant'
