const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de relatórios ambientais finais de projetos ecológicos
const reportSchema = new mongoose.Schema({
  // Referência ao Projeto que foi alvo do relatório
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // Referência ao utilizador (coordenador/admin) que gerou/carregou o relatório
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Caminho/URL de acesso ao ficheiro PDF do relatório final
  filePath:    { type: String },
  // Notas descritivas, conclusões ou observações adicionais anexadas ao relatório
  notes:       { type: String },
}, { timestamps: true }); // Adiciona tempos de criação e modificação do relatório

module.exports = mongoose.model('Report', reportSchema); // Exporta o modelo com o nome 'Report'
