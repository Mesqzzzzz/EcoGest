const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema das perguntas de auditorias ecológicas
const auditQuestionSchema = new mongoose.Schema({
  // Categoria da auditoria (ex: Água, Energia, Resíduos, Alimentação, Transportes)
  category: { type: String, required: true },
  // Código único de identificação da questão (ex: W1, E3, etc.) para simplificar referências
  code:     { type: String, required: true, unique: true },
  // Texto descritivo e enunciado completo da pergunta
  text:     { type: String, required: true },
  // Lista opcional de opções de resposta fechadas (ex: ["Sim", "Não", "Parcial"])
  options:  [{ type: String }],
}, { timestamps: true }); // Ativa os campos createdAt e updatedAt automáticos

module.exports = mongoose.model('AuditQuestion', auditQuestionSchema); // Exporta o modelo com o nome 'AuditQuestion'
