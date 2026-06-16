const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para guardar a filiação dos membros nos conselhos consultivos de projetos
const councilMemberSchema = new mongoose.Schema({
  // Referência ao Utilizador que é membro do conselho
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Referência ao Projeto no qual o membro do conselho está envolvido
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Função desempenhada dentro do conselho (ex: 'member', 'chair')
  role:    { type: String, default: 'member' },
}, { timestamps: true }); // Ativa os registos automáticos de timestamps

module.exports = mongoose.model('CouncilMember', councilMemberSchema); // Exporta o modelo com o nome 'CouncilMember'
