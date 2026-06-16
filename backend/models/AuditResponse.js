const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para guardar as respostas dadas às perguntas de auditoria de um projeto
const auditResponseSchema = new mongoose.Schema({
  // Referência ao Projeto cujos indicadores ambientais estão a ser auditados
  project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Referência à Pergunta de auditoria respondida
  question:   { type: mongoose.Schema.Types.ObjectId, ref: 'AuditQuestion', required: true },
  // Valor da resposta preenchido (ex: "Sim", "Não", "50%" ou valor numérico)
  value:      { type: String, required: true },
  // Classificação ou pontuação atribuída a esta resposta específica (de 0 a 100) para cálculo de conformidade
  score:      { type: Number, default: 0 },
  // Comentários ou notas explicativas adicionais à resposta dada
  comments:   { type: String },
  // Referência ao utilizador autenticado que submeteu e respondeu à questão
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }); // Ativa criação automática de campos de auditoria temporal (createdAt, updatedAt)

module.exports = mongoose.model('AuditResponse', auditResponseSchema); // Exporta o modelo com o nome 'AuditResponse'
