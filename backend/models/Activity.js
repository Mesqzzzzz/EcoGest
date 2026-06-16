const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema do modelo de Atividades
const activitySchema = new mongoose.Schema({
  // Referência ao Projeto associado a esta atividade
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Nome da atividade com limite de 150 caracteres
  name:        { type: String, required: true, maxlength: 150 },
  // Descrição descritiva detalhada da atividade
  description: { type: String },
  // Local físico onde decorre a atividade
  location:    { type: String, maxlength: 200 },
  // Data e hora de início planeada da atividade
  startDate:   { type: Date },
  // Data e hora de fim planeada da atividade
  endDate:     { type: Date },
  // Estado da atividade: planeada, ativa ou concluída
  status:      { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  // Visibilidade: pública (visível a todos) ou privada (restrita)
  visibility:  { type: String, enum: ['public', 'private'], default: 'public' },
  // Lista de áreas ambientais abrangidas (ex: Água, Resíduos)
  areas:       [{ type: String }],
  // Recursos materiais ou humanos necessários para a atividade
  resources:   { type: String },
  // Notas sobre a execução após a conclusão da atividade
  executionNotes: { type: String },
  // Local efetivo de execução da atividade
  executionLocation: { type: String },
  // Referência ao utilizador coordenador que criou a atividade
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }); // Adiciona campos createdAt e updatedAt geridos automaticamente pelo Mongoose

module.exports = mongoose.model('Activity', activitySchema); // Exporta o modelo com o nome 'Activity'
