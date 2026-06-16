const { Project, User, Activity } = require('../models'); // Importa os modelos do Mongoose necessários para lidar com Projetos

// Função auxiliar interna para calcular dinamicamente o galardão do projeto com base nas atividades e áreas temáticas realizadas
const calculateProjectLevel = async (project) => {
  const activities = await Activity.find({ project: project._id }); // Obtém todas as atividades do projeto
  const uniqueAreas = new Set(); // Conjunto único para evitar áreas temáticas duplicadas
  activities.forEach(a => {
    if (a.areas && Array.isArray(a.areas)) {
      a.areas.forEach(ar => uniqueAreas.add(ar)); // Adiciona cada área temática ao conjunto
    }
  });

  const totalAct = activities.length; // Quantidade total de atividades realizadas
  const totalAreas = uniqueAreas.size; // Quantidade de áreas temáticas distintas abordadas

  let computedLevel = null; // Classificação padrão
  // Regra de atribuição de galardão Eco-Escolas:
  // - Ouro (Gold): Pelo menos 8 atividades e 4 áreas
  // - Prata (Silver): Pelo menos 4 atividades e 2 áreas
  // - Bronze: Pelo menos 1 atividade realizada
  if (totalAct >= 8 && totalAreas >= 4) {
    computedLevel = 'gold';
  } else if (totalAct >= 4 && totalAreas >= 2) {
    computedLevel = 'silver';
  } else if (totalAct >= 1) {
    computedLevel = 'bronze';
  }

  // Se a classificação calculada for diferente da guardada, atualiza na BD de forma assíncrona
  if (project.level !== computedLevel) {
    project.level = computedLevel;
    await project.save();
  }

  // Retorna os dados calculados para inclusão nas estatísticas
  return { level: computedLevel, activitiesCount: totalAct, areasCount: totalAreas };
};

// GET /api/projects
// Lista todos os projetos ecológicos registados, aplicando cálculo dinâmico de galardões e estatísticas
exports.getProjects = async (req, res) => {
  try {
    const filter = {}; // Filtros Mongoose
    if (req.query.status) filter.status = req.query.status; // Filtro por estado
    if (req.query.year)   filter.year   = parseInt(req.query.year); // Filtro por ano de vigência

    // Obtém projetos e preenche a referência de coordenador
    const projects = await Project.find(filter)
      .populate('coordinator', 'name email _id');

    // Mapeia e junta o cálculo de galardão dinâmico em paralelo para todos os projetos
    const data = await Promise.all(projects.map(async p => {
      const stats = await calculateProjectLevel(p);
      return {
        id: p._id, name: p.name, year: p.year, status: p.status, 
        level: stats.level, coordinator: p.coordinator,
        activitiesCount: stats.activitiesCount,
        areasCount: stats.areasCount,
      };
    }));

    res.json({ data }); // Envia resposta JSON com a lista formatada
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/projects/:id
// Obtém dados e classificação dinâmica detalhada de um único projeto ambiental
exports.getProject = async (req, res) => {
  try {
    // Procura o projeto por ID na base de dados
    const p = await Project.findById(req.params.id)
      .populate('coordinator', 'name email _id');
    if (!p) return res.status(404).json({ error: 'Project not found' }); // Retorna 404 se não for encontrado
    
    const stats = await calculateProjectLevel(p); // Calcula os dados estatísticos
    // Retorna a informação completa consolidada
    res.json({ 
      id: p._id, name: p.name, year: p.year, status: p.status, 
      level: stats.level, coordinator: p.coordinator,
      activitiesCount: stats.activitiesCount,
      areasCount: stats.areasCount
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/projects
// Cria um novo projeto associado a um determinado ano letivo/civil
exports.createProject = async (req, res) => {
  try {
    const { name, year, level } = req.body;
    // Impede a criação de múltiplos projetos para o mesmo ano de vigência
    const exists = await Project.findOne({ year: parseInt(year) });
    if (exists) return res.status(409).json({ error: 'Project for this year already exists' }); // Conflito (409)
    // Insere o projeto na base de dados
    const p = await Project.create({ name, year: parseInt(year), level: level || null });
    res.status(201).json({ id: p._id, status: p.status }); // Retorna sucesso 201
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/projects/:id
// Atualiza metadados estruturais do projeto
exports.updateProject = async (req, res) => {
  try {
    // Procura por ID e atualiza
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json({ id: p._id, name: p.name, year: p.year, status: p.status }); // Confirma dados atuais do projeto
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/projects/:id/status
// Efetua transições de estado controladas de um projeto ecológico (planeamento -> ativo -> concluído)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Define a máquina de estados para transições válidas de projetos
    const transitions = { planning: ['active'], active: ['finished'], finished: [] };
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    
    // Garante que o projeto segue apenas as transições de estado permitidas
    if (!transitions[p.status]?.includes(status))
      return res.status(400).json({ error: `Invalid transition: ${p.status} → ${status}` });
    // Impede a ativação do projeto caso este ainda não tenha um coordenador designado
    if (status === 'active' && !p.coordinator)
      return res.status(400).json({ error: 'Coordinator not assigned' });
    
    p.status = status; // Atualiza o estado
    await p.save(); // Salva no Mongoose
    res.json({ status }); // Retorna o novo estado
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/projects/:id/coordinator
// Atribui um utilizador com perfil adequado (coordenador ou administrador) como responsável do projeto
exports.assignCoordinator = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findById(user_id); // Procura o utilizador pretendido
    if (!user) return res.status(400).json({ error: 'User not found' });
    // Restringe a atribuição apenas a utilizadores com perfis de liderança autorizados
    if (!['coordinator', 'admin'].includes(user.role))
      return res.status(400).json({ error: 'User is not a coordinator' });
    
    // Associa o ID do utilizador ao campo coordinator do projeto
    const p = await Project.findByIdAndUpdate(req.params.id, { coordinator: user_id }, { new: true });
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Coordinator assigned' }); // Retorna confirmação de sucesso
  } catch (e) { res.status(500).json({ error: e.message }); }
};
