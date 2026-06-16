const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para organização das rotas de projetos
const projectsController = require('../controllers/projects'); // Importa o controlador para lógica de projetos
const { authenticate } = require('../middleware/auth'); // Importa o middleware de autenticação (JWT)
const { authorize } = require('../middleware/roles'); // Importa o middleware de autorização por perfis (roles)

// Rota autenticada para listar projetos (filtra por utilizador se o utilizador não for admin)
router.get('/', authenticate, projectsController.getProjects);
// Rota autenticada para obter os detalhes de um projeto específico
router.get('/:id', authenticate, projectsController.getProject);
// Rota administrativa para criar um novo projeto ambiental no sistema
router.post('/', authenticate, authorize('admin'), projectsController.createProject);
// Rota administrativa para atualizar metadados gerais de um projeto
router.patch('/:id', authenticate, authorize('admin'), projectsController.updateProject);
// Rota administrativa para alterar o estado do projeto (planeado, em progresso, concluído, cancelado)
router.patch('/:id/status', authenticate, authorize('admin'), projectsController.updateStatus);
// Rota administrativa para atribuir ou alterar o coordenador associado ao projeto
router.patch('/:id/coordinator', authenticate, authorize('admin'), projectsController.assignCoordinator);

module.exports = router; // Exporta o router de projetos
