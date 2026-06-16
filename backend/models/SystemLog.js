const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de logs gerais de auditoria de operações críticas do sistema
const systemLogSchema = new mongoose.Schema({
  // Nível de gravidade do log: info (informativo), warn (aviso) ou error (erro)
  level:    { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  // Mensagem textual explicativa sobre a operação ou erro registado
  message:  { type: String, required: true },
  // Metadados adicionais em formato flexível (JSON) contendo dados de contexto adicionais
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true }); // Adiciona carimbo de data/hora de registo automático

module.exports = mongoose.model('SystemLog', systemLogSchema); // Exporta o modelo com o nome 'SystemLog'
