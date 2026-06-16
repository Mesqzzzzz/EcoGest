require('dotenv').config(); // Carrega as variáveis de ambiente do ficheiro .env
const express   = require('express'); // Importa a framework Express para criação da API web
const cors      = require('cors'); // Importa o middleware CORS para permitir pedidos cross-origin
const path      = require('path'); // Importa o módulo nativo path para lidar com caminhos de ficheiros
const connectDB = require('./config/database'); // Importa a função de ligação à base de dados MongoDB

const app = express(); // Inicializa a aplicação Express

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors()); // Ativa o middleware CORS para aceitar pedidos de origens externas
app.use(express.json()); // Permite ao Express interpretar corpos de pedidos em formato JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve ficheiros estáticos da pasta 'uploads' na rota '/uploads'

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/users',      require('./routes/users')); // Rota para gestão de utilizadores e autenticação
app.use('/api/activities', require('./routes/activities')); // Rota para gestão e participação em atividades
app.use('/api/proposals',  require('./routes/proposals')); // Rota para propostas ambientais
app.use('/api/meetings',   require('./routes/meetings')); // Rota para gestão de reuniões e atas
app.use('/api/projects',   require('./routes/projects')); // Rota para gestão de projetos
app.use('/api/admin',      require('./routes/admin')); // Rota para painel administrativo e auditorias/backups
app.use('/api/audits',     require('./routes/audits')); // Rota para visualização e resposta a auditorias

// ── Swagger Documentation ────────────────────────────────────────────
const swaggerUi = require('swagger-ui-express'); // Importa a interface gráfica do Swagger para documentação
const swaggerDocument = require('./docs/swagger.json'); // Carrega a especificação JSON do Swagger da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Serve a documentação interativa na rota '/api-docs'

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongodb' })); // Rota simples para verificar o estado da API e BD

// ── Error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack); // Regista o stack trace do erro no terminal para depuração
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }); // Responde com o status do erro ou 500 (Erro Interno)
});

// ── Start ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000; // Define o porto da aplicação a partir das variáveis de ambiente ou usa o 3000 por defeito

connectDB().then(() => { // Liga à base de dados e depois inicia o servidor HTTP
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`); // Mensagem informativa de que o servidor está ativo
  });
});