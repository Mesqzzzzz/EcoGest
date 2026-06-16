const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para controlo e registo dos backups efetuados na base de dados
const backupSchema = new mongoose.Schema({
  // Nome do ficheiro de backup gerado (ex: ecogest-backup-1718000000.tar)
  fileName:    { type: String, required: true },
  // Caminho completo ou chave do objeto no MinIO/armazenamento em nuvem
  filePath:    { type: String },
  // Tamanho do ficheiro em formato legível (ex: "1.2 MB" ou "450 KB")
  size:        { type: String },
  // Notas descritivas adicionais ou justificação do backup (ex: "Backup semanal automático")
  description: { type: String },
  // Referência ao utilizador administrador que despoletou a criação do backup
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true }); // Ativa criação automática dos timestamps

module.exports = mongoose.model('Backup', backupSchema); // Exporta o modelo com o nome 'Backup'
