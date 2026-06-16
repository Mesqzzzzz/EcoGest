const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para organizar caminhos de reuniões
const meetingsController = require('../controllers/meetings'); // Importa o controlador para lógica de reuniões e atas
const { authenticate } = require('../middleware/auth'); // Importa o middleware de autenticação (JWT)
const { authorize } = require('../middleware/roles'); // Importa o middleware de autorização por perfis (roles)
const upload = require('../utils/upload'); // Importa o utilitário configurado de upload de ficheiros (Multer)

// Rota autenticada para listar todas as reuniões do sistema (acessível a qualquer perfil autenticado)
router.get('/', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary', 'user'), meetingsController.getMeetings);
// Rota autenticada para obter os detalhes de uma reunião específica (incluindo atas e documentos)
router.get('/:id', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary', 'user'), meetingsController.getMeeting);
// Rota para criar reuniões (apenas secretários e administradores podem agendar)
router.post('/', authenticate, authorize('secretary', 'admin'), meetingsController.createMeeting);
// Rota para atualizar metadados de uma reunião (restrito a secretário e administrador)
router.patch('/:id', authenticate, authorize('secretary', 'admin'), meetingsController.updateMeeting);
// Rota para eliminar/cancelar uma reunião específica (restrito a secretário e administrador)
router.delete('/:id', authenticate, authorize('secretary', 'admin'), meetingsController.deleteMeeting);

// Rota para simular/despoletar envio de convocações de email para membros do conselho (restrito a secretário e administrador)
router.post('/:id/convocations', authenticate, authorize('secretary', 'admin'), meetingsController.sendConvocations);
// Rota para ler todos os documentos/atas carregados de uma reunião (restrito a admin, coordenador, membro conselho, secretário)
router.get('/:id/documents', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary'), meetingsController.getDocuments);
// Rota para carregar documentos/atas associados a uma reunião (restrito a secretário e administrador)
router.post('/:id/documents', authenticate, authorize('secretary', 'admin'), upload.single('document'), meetingsController.uploadDocument);
// Rota para apagar um documento/ata de uma reunião pelo ID do documento (restrito a secretário e administrador)
router.delete('/documents/:id', authenticate, authorize('secretary', 'admin'), meetingsController.deleteDocument);

module.exports = router; // Exporta o router de reuniões
