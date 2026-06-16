const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para organização das rotas de admin
const adminController = require('../controllers/admin'); // Importa o controlador administrativo geral
const proposalsController = require('../controllers/proposals'); // Importa o controlador de propostas (para alteração de estado)
const backupsController = require('../controllers/backups'); // Importa o controlador de backups do sistema
const { authenticate } = require('../middleware/auth'); // Importa o middleware de autenticação (JWT)
const { authorize } = require('../middleware/roles'); // Importa o middleware de autorização baseado em perfis

// ── Dashboard & Relatórios ───────────────────────────────────────────
// Rota para obter dados estatísticos do dashboard (restrito a admin, coordenador e membros do conselho)
router.get('/dashboard', authenticate, authorize('admin', 'coordinator', 'council_member'), adminController.getDashboard);
// Rota para obter metadados do último relatório ambiental gerado (restrito a admin e coordenador)
router.get('/report', authenticate, authorize('admin', 'coordinator'), adminController.getReport);
// Rota para despoletar a geração de um novo relatório ambiental em PDF (restrito a admin e coordenador)
router.post('/report', authenticate, authorize('admin', 'coordinator'), adminController.generateReport);

// ── Gestão de Utilizadores (Admin/Coordenador) ───────────────────────
// Rota para listar utilizadores registados no sistema
router.get('/users', authenticate, authorize('admin', 'coordinator'), adminController.getUsers);
// Rota para criar manualmente um novo utilizador
router.post('/users', authenticate, authorize('admin', 'coordinator'), adminController.createUser);
// Rota para atualizar os dados gerais de um utilizador específico
router.patch('/users/:id', authenticate, authorize('admin', 'coordinator'), adminController.updateUser);
// Rota para alterar o estado ativo/inativo ou perfil de um utilizador específico
router.patch('/users/:id/status', authenticate, authorize('admin', 'coordinator'), adminController.updateUserStatus);

// ── Gestão de Atividades (Admin/Coordenador/Membro Conselho) ─────────
// Rota para listar todas as atividades em ambiente de gestão administrativa
router.get('/activities', authenticate, authorize('admin', 'coordinator', 'council_member'), adminController.getActivities);
// Rota para criar uma nova atividade ambiental
router.post('/activities', authenticate, authorize('admin', 'coordinator', 'council_member'), adminController.createActivity);
// Rota para atualizar os dados de uma atividade
router.patch('/activities/:id', authenticate, authorize('admin', 'coordinator', 'council_member'), adminController.updateActivity);
// Rota para alterar o estado (ativo, cancelado, etc.) ou visibilidade de uma atividade
router.patch('/activities/:id/status', authenticate, authorize('admin', 'coordinator', 'council_member'), adminController.updateActivityStatus);

// ── Gestão de Propostas (Admin/Coordenador) ──────────────────────────
// Rota para aprovar, rejeitar ou marcar propostas para discussão no conselho
router.patch('/proposals/:id/status', authenticate, authorize('admin', 'coordinator'), proposalsController.updateStatus);

// ── Gestão de Backups (Restrito a Administrador) ──────────────────────
// Rota para listar todos os backups de base de dados registados no sistema
router.get('/backups', authenticate, authorize('admin'), backupsController.getBackups);
// Rota para criar um novo backup da base de dados e fazer upload para o MinIO/armazenamento
router.post('/backups', authenticate, authorize('admin'), backupsController.createBackup);
// Rota para restaurar a base de dados a partir de um backup específico
router.post('/backups/:id/restore', authenticate, authorize('admin'), backupsController.restoreBackup);

module.exports = router; // Exporta o router de administração
