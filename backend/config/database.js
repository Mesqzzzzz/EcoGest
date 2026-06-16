const mongoose = require('mongoose'); // Importa a biblioteca Mongoose para interagir com o MongoDB
require('dotenv').config(); // Carrega as variáveis de ambiente a partir do ficheiro .env

// Função assíncrona para estabelecer a ligação com a base de dados
const connectDB = async () => {
  try {
    // Tenta ligar ao MongoDB Atlas usando o URI fornecido nas variáveis de ambiente
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Tempo limite de 10 segundos para selecionar o servidor
    });
    console.log('✅ MongoDB Atlas connected successfully'); // Mensagem de sucesso na ligação
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message); // Mensagem de erro se a ligação falhar
    process.exit(1); // Encerra o processo da aplicação com código de falha (1)
  }
};

module.exports = connectDB; // Exporta a função de ligação para ser usada noutros ficheiros
