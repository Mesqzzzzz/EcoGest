const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de Utilizadores no sistema
const userSchema = new mongoose.Schema({
  // Nome completo do utilizador (limite de 100 caracteres)
  name:     { type: String, required: true, maxlength: 100 },
  // Endereço de correio eletrónico único, sempre em minúsculas e sem espaços adicionais
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Hash da palavra-passe criptografada para segurança do acesso
  password: { type: String, required: true },
  // Função/Perfil do utilizador no sistema para controlo de acessos (RBAC)
  role:     { type: String, enum: ['admin', 'coordinator', 'secretary', 'council_member', 'user'], default: 'user' },
  // Estado de atividade do utilizador (active = pode fazer login, inactive = conta suspensa)
  status:   { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true }); // Ativa os campos de data de registo e última modificação (createdAt, updatedAt)

module.exports = mongoose.model('User', userSchema); // Exporta o modelo com o nome 'User'
