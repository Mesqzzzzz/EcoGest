const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de propostas de atividades submetidas pelos membros do conselho
const proposalSchema = new mongoose.Schema({
  // Título descritivo curto da proposta (ex: "Instalação de compostores no jardim")
  title:       { type: String, required: true },
  // Descrição detalhada do plano de ação e objetivos
  description: { type: String },
  // Área temática em que a proposta se insere (ex: Resíduos, Água)
  area:        { type: String },
  // Previsão de início de execução da atividade
  startDate:   { type: Date },
  // Previsão de fim da execução da atividade
  endDate:     { type: Date },
  // Recursos materiais, financeiros ou humanos necessários previstos
  resources:   { type: String },
  // Referência ao Projeto do ano corrente a que esta proposta se associa
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Referência ao utilizador (membro do conselho) que elaborou e submeteu a proposta
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Referência ao utilizador (coordenador ou administrador) que reviu a proposta
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Estado atual de aprovação da proposta: pendente, aprovada ou rejeitada
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  // Nota explicativa ou feedback fornecido na revisão da proposta
  reviewNote:  { type: String },
}, { timestamps: true }); // Ativa os campos automáticos createdAt e updatedAt geridos pelo Mongoose

module.exports = mongoose.model('Proposal', proposalSchema); // Exporta o modelo com o nome 'Proposal'
