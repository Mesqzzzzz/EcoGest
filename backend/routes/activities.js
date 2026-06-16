const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para organizar caminhos de rotas
const activitiesController = require('../controllers/activities'); // Importa o controlador para lógica de atividades
const { authenticate, optionalAuth } = require('../middleware/auth'); // Importa middlewares de autenticação
const { authorize } = require('../middleware/roles'); // Importa middleware de autorização por perfis (roles)
const upload = require('../utils/upload'); // Importa o utilitário de upload de ficheiros (Multer)

// Rota pública (com autenticação opcional) para listar atividades
router.get('/', optionalAuth, activitiesController.getActivities);
// Rota pública para obter detalhes de uma atividade pelo ID
router.get('/:id', activitiesController.getActivity);
// Rota com autenticação opcional para registar a participação numa atividade (pode ser utilizador ou convidado)
router.post('/:id/participations', optionalAuth, activitiesController.participate);
// Rota autenticada para um utilizador cancelar a sua própria participação numa atividade
router.delete('/:id/participations/:pid', authenticate, activitiesController.cancelParticipation);

// Rota autenticada para listar todos os participantes de uma atividade
router.get('/:id/participants', authenticate, activitiesController.listParticipants);
// Rota para coordenador ou membro do conselho registar um participante (utilizador ou convidado) manualmente
router.post('/:id/participants', authenticate, authorize('coordinator', 'council_member'), activitiesController.addParticipant);
// Rota para coordenador ou membro do conselho registar a execução/finalização de uma atividade
router.post('/:id/executions', authenticate, authorize('coordinator', 'council_member'), activitiesController.registerExecution);
// Rota para coordenador ou membro do conselho carregar fotos de uma atividade realizada
router.post('/:id/photos', authenticate, authorize('coordinator', 'council_member'), upload.single('photo'), activitiesController.uploadPhoto);

module.exports = router; // Exporta o router configurado das atividades