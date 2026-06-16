const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de registos de autenticação (logs de segurança)
const authLogSchema = new mongoose.Schema({
  // Referência ao utilizador envolvido na tentativa de login (pode ser nulo caso o email não exista)
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Ação realizada (ex: "login", "failed_login", "logout")
  action:     { type: String, required: true },
  // Indicador binário de sucesso ou falha da operação de autenticação
  success:    { type: Boolean, default: false },
  // Endereço IP de origem do pedido
  ipAddress:  { type: String },
  // Informação simplificada sobre o dispositivo/browser do utilizador
  deviceInfo: { type: String },
}, { timestamps: true }); // Adiciona campos de data de criação automática (createdAt, updatedAt)

module.exports = mongoose.model('AuthLog', authLogSchema); // Exporta o modelo com o nome 'AuthLog'
