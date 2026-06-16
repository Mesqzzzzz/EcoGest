const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para organização das rotas de utilizadores
const usersController = require('../controllers/users'); // Importa o controlador para lógica de utilizadores
const { authenticate } = require('../middleware/auth'); // Importa o middleware de autenticação (JWT)

// Rota pública para registar um novo utilizador no sistema (autocadastro)
router.post('/', usersController.register);
// Rota pública para login de utilizadores (autenticação com email e password)
router.post('/login', usersController.login);
// Rota pública para renovar o Access Token a partir de um Refresh Token válido
router.post('/refresh', usersController.refresh);
// Rota pública para terminar uma sessão ativa invalidando o refresh token correspondente
router.post('/logout-session', usersController.logoutSession);
// Rota autenticada para obter os dados do perfil do próprio utilizador logado
router.get('/me', authenticate, usersController.getMe);
// Rota autenticada para o próprio utilizador atualizar os seus dados de perfil (nome, email, password)
router.patch('/me', authenticate, usersController.updateMe);
// Rota autenticada para o próprio utilizador desativar/alterar o estado da sua própria conta
router.patch('/me/status', authenticate, usersController.updateMyStatus);

module.exports = router; // Exporta o router de utilizadores
