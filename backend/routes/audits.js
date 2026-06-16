const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para gestão de rotas de auditoria
const auditsController = require('../controllers/audits'); // Importa o controlador para lógica de auditorias ambientais
const { authenticate } = require('../middleware/auth'); // Importa o middleware de autenticação JWT
const { authorize } = require('../middleware/roles'); // Importa o middleware de autorização por perfis (roles)

// Rota para qualquer utilizador autenticado obter a lista de perguntas predefinidas para a auditoria
router.get('/questions', authenticate, auditsController.getQuestions);
// Rota para ler respostas a auditorias de um projeto específico (restrito a admin, coordenador, membro do conselho e secretário)
router.get('/responses/:projectId', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary'), auditsController.getResponses);
// Rota para submeter respostas a uma auditoria (coordenador ou membro do conselho associado ao projeto)
router.post('/responses', authenticate, authorize('coordinator', 'council_member'), auditsController.submitResponses);
// Rota para obter o relatório descritivo e percentagem de conformidade de um projeto
router.get('/report/:projectId', authenticate, auditsController.getAuditReport);

module.exports = router; // Exporta o router de auditorias
