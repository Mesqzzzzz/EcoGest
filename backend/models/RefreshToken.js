const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de Refresh Tokens (permite manter os utilizadores logados com segurança)
const refreshTokenSchema = new mongoose.Schema({
  // String única do token (UUID ou hash criptográfico)
  token:     { type: String, required: true, unique: true },
  // Referência ao utilizador titular do refresh token
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Data e hora em que o Refresh Token expira e deixa de ser válido
  expiresAt: { type: Date, required: true },
}, { timestamps: true }); // Adiciona registos automáticos de tempos de criação e modificação

module.exports = mongoose.model('RefreshToken', refreshTokenSchema); // Exporta o modelo com o nome 'RefreshToken'
