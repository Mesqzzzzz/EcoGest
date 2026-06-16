const { Proposal, Activity } = require('../models'); // Importa os modelos de Mongoose necessários para lidar com propostas e atividades

// GET /api/proposals
// Lista as propostas existentes. Limita o acesso de membros do conselho apenas às propostas criadas por eles próprios
exports.getProposals = async (req, res) => {
  try {
    const filter = {}; // Objeto de filtragem de base
    // Se o perfil do utilizador logado for de membro do conselho, restringe a visualização às propostas do próprio
    if (req.user.role === 'council_member') filter.createdBy = req.user._id;
    if (req.query.status) filter.status = req.query.status; // Filtro opcional por estado
    const proposals = await Proposal.find(filter)
      .populate('createdBy', 'name email _id') // Preenche detalhes básicos do autor da proposta
      .sort({ createdAt: -1 }); // Ordena por data de criação de forma decrescente (mais recentes primeiro)
    res.json({ data: proposals }); // Retorna a lista de propostas
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/proposals/:id
// Obtém os detalhes completos de uma proposta específica identificada por ID
exports.getProposal = async (req, res) => {
  try {
    // Procura a proposta preenchendo o nome e ID do utilizador autor da mesma
    const p = await Proposal.findById(req.params.id).populate('createdBy', 'name _id');
    if (!p) return res.status(404).json({ error: 'Proposal not found' }); // Retorna 404 se não for encontrada
    // Garante que membros do conselho não podem aceder a propostas submetidas por outros membros
    if (req.user.role === 'council_member' && !p.createdBy._id.equals(req.user._id))
      return res.status(403).json({ error: 'Forbidden' }); // Retorna erro 403 (Proibido)
    res.json(p); // Retorna a proposta
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/proposals
// Submete uma nova proposta de atividade associada a um projeto anual
exports.createProposal = async (req, res) => {
  try {
    const { title, description, area, start_date, end_date, resources, project_id } = req.body;
    // Exige campos mínimos obrigatórios de validação
    if (!title || !project_id)
      return res.status(400).json({ error: 'title and project_id required' });
    // Cria o documento de proposta com o ID do utilizador logado como autor
    const p = await Proposal.create({
      title, description, area,
      startDate: start_date, endDate: end_date,
      resources, project: project_id, createdBy: req.user._id,
    });
    res.status(201).json({ id: p._id, status: p.status }); // Retorna sucesso 201
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/proposals/:id/status
// Altera o estado de aprovação de uma proposta e, caso seja aprovada, cria automaticamente uma atividade associada
exports.updateStatus = async (req, res) => {
  try {
    const { status, review_note } = req.body;
    // Garante que o novo estado é um dos estados de revisão aceites (approved ou rejected)
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });
    
    const p = await Proposal.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' }); // Retorna 404 se não encontrada
    
    // Regista a decisão de aprovação/rejeição, o ID do revisor e notas de revisão
    p.status = status; p.reviewedBy = req.user._id; p.reviewNote = review_note;
    await p.save(); // Grava as alterações na proposta
    
    // Se a proposta for aprovada, cria automaticamente uma nova atividade planeada com os dados da proposta
    if (status === 'approved') {
      const act = await Activity.create({
        project: p.project, name: p.title, description: p.description,
        startDate: p.startDate, endDate: p.endDate,
        areas: p.area ? [p.area] : [],
        status: 'planned', visibility: 'public', createdBy: req.user._id, // Define o revisor como criador da atividade
      });
      // Retorna sucesso confirmando a criação da atividade planeada
      return res.json({ message: 'Proposal approved and activity created', activity_id: act._id });
    }
    res.json({ message: `Proposal ${status}` }); // Confirmação de rejeição
  } catch (e) { res.status(500).json({ error: e.message }); }
};
