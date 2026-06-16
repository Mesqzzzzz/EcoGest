const express = require('express'); // Importa a framework Express
const router = express.Router(); // Cria um router do Express para caminhos de propostas
const proposalsController = require('../controllers/proposals'); // Importa o controlador para lógica de propostas ambientais
const { authenticate } = require('../middleware/auth'); // Importa o middleware de autenticação (JWT)
const { authorize } = require('../middleware/roles'); // Importa o middleware de autorização por perfis (roles)

// Rota autenticada para listar propostas ambientais (acessível a admin, coordenador e membro do conselho)
router.get('/', authenticate, authorize('admin', 'coordinator', 'council_member'), proposalsController.getProposals);
// Rota autenticada para obter os detalhes de uma proposta específica (restrita a admin, coordenador e membro do conselho)
router.get('/:id', authenticate, authorize('admin', 'coordinator', 'council_member'), proposalsController.getProposal);
// Rota autenticada para submeter uma nova proposta (restrito a membros do conselho)
router.post('/', authenticate, authorize('council_member'), proposalsController.createProposal);

module.exports = router; // Exporta o router de propostas
