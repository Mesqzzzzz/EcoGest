const mongoose = require('mongoose'); // Importa a biblioteca Mongoose

// Define o esquema para armazenamento de ficheiros e atas de reuniões
const meetingDocumentSchema = new mongoose.Schema({
  // Referência à Reunião à qual o documento ou ata está associado
  meeting:     { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  // Nome amigável do documento (ex: "Ata Oficial de Reunião de Planeamento")
  name:        { type: String, required: true },
  // Link/caminho absoluto de armazenamento onde o ficheiro se encontra guardado
  documentUrl: { type: String },
  // Tipo de documento: agenda (convocatória), minutes (ata) ou outro
  type:        { type: String, enum: ['agenda', 'minutes', 'other'], default: 'other' },
  // Referência ao utilizador (secretário/admin) que efetuou o upload do ficheiro
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true }); // Ativa os campos automáticos createdAt e updatedAt

module.exports = mongoose.model('MeetingDocument', meetingDocumentSchema); // Exporta o modelo com o nome 'MeetingDocument'
