const multer = require('multer'); // Importa o middleware multer para upload de ficheiros multipart/form-data
const path = require('path'); // Importa o módulo nativo path para manipulação de caminhos
const fs = require('fs'); // Importa o módulo nativo filesystem para verificar e criar pastas

// Define o caminho absoluto para a pasta onde os uploads serão guardados
const uploadDir = path.join(__dirname, '..', 'uploads');
// Cria o diretório de uploads recursivamente caso este ainda não exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do motor de armazenamento em disco do multer
const storage = multer.diskStorage({
  // Define a pasta de destino dos ficheiros carregados
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Define o nome final do ficheiro para evitar colisões (timestamp + nome sem espaços)
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Filtro de validação dos tipos de ficheiro permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Lista de MimeTypes aceites
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceita o ficheiro caso o MimeType esteja na lista
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF allowed.'), false); // Rejeita o ficheiro com um erro
  }
};

// Inicialização e configuração da instância do Multer
const upload = multer({
  storage: storage, // Aplica as configurações do motor de armazenamento
  limits: { fileSize: 1024 * 1024 * 5 }, // Define o limite máximo de tamanho de ficheiro para 5MB
  fileFilter: fileFilter // Aplica o filtro de tipo de ficheiro
});

module.exports = upload; // Exporta a instância configurada do Multer
