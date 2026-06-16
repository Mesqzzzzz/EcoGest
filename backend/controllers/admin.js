const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs para hash seguro de passwords
const { User, Activity, ActivityParticipant, Proposal, Meeting, Project, ActivityImage } = require('../models'); // Importa todos os modelos do Mongoose necessários

// GET /api/admin/dashboard
// Obtém estatísticas gerais para o painel de administração e dados de evolução mensal dos últimos 6 meses
exports.getDashboard = async (req, res) => {
  try {
    // Executa em paralelo a contagem de vários indicadores ecológicos e estatísticas
    const [totalAct, plannedAct, activeAct, completedAct, participants, pendingProposals] =
      await Promise.all([
        Activity.countDocuments(), // Contagem total de atividades
        Activity.countDocuments({ status: 'planned' }), // Contagem de atividades planeadas
        Activity.countDocuments({ status: 'active' }), // Contagem de atividades ativas
        Activity.countDocuments({ status: 'completed' }), // Contagem de atividades concluídas
        ActivityParticipant.countDocuments(), // Contagem total de participações em atividades
        Proposal.countDocuments({ status: 'pending' }), // Contagem de propostas ambientais pendentes
      ]);

    // Calcula a data de início para obter o histórico dos últimos 6 meses (Month over Month)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Define para o primeiro dia desse mês de início
    sixMonthsAgo.setHours(0, 0, 0, 0); // Zera as horas para consistência de datas

    // Procura atividades completadas e imagens recolhidas a partir da data calculada
    const [completedActivitiesLast6Months, imagesLast6Months] = await Promise.all([
      Activity.find({ status: 'completed', updatedAt: { $gte: sixMonthsAgo } }),
      ActivityImage.find({ createdAt: { $gte: sixMonthsAgo } }),
    ]);

    const monthlyStats = []; // Array que irá armazenar os dados estatísticos por cada mês
    const now = new Date();
    // Preenche a lista de estatísticas mensais retrocedendo de 5 meses até ao mês atual
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleString('en-US', { month: 'short' }); // Rótulo do mês em inglês
      const ptLabel = d.toLocaleString('pt-PT', { month: 'short' }); // Rótulo do mês em português

      // Filtra e conta as atividades concluídas no mês e ano correntes
      const actsCount = completedActivitiesLast6Months.filter(a => {
        const u = new Date(a.updatedAt);
        return u.getFullYear() === year && u.getMonth() === month;
      }).length;

      // Filtra e conta as fotos recolhidas no mês e ano correntes
      const photosCount = imagesLast6Months.filter(img => {
        const c = new Date(img.createdAt);
        return c.getFullYear() === year && c.getMonth() === month;
      }).length;

      // Adiciona o objeto de estatísticas mensais à lista
      monthlyStats.push({
        label,
        ptLabel,
        year,
        month: month + 1,
        completedActivities: actsCount,
        photosCollected: photosCount
      });
    }

    // Retorna todos os dados recolhidos para preenchimento dos gráficos do frontend
    res.json({
      activities: { total: totalAct, planned: plannedAct, active: activeAct, completed: completedAct },
      participants,
      proposals: { pending: pendingProposals },
      monthlyStats
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/users
// Obtém a lista de utilizadores filtrada por perfil (role), estado ou termo de pesquisa
exports.getUsers = async (req, res) => {
  try {
    const filter = {}; // Objeto de filtros para a query Mongoose
    if (req.query.role)   filter.role   = req.query.role; // Filtro por papel específico
    if (req.query.status) filter.status = req.query.status; // Filtro por estado ativo/inativo
    if (req.query.search) filter.name   = new RegExp(req.query.search, 'i'); // Pesquisa parcial de nome (case-insensitive)
    const users = await User.find(filter).select('-password'); // Omitir a password das informações retornadas
    res.json({ data: users }); // Retorna os utilizadores em formato JSON
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/users
// Permite a criação de um novo utilizador, aplicando limites de permissão com base no perfil do criador
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const validRoles = ['admin', 'coordinator', 'secretary', 'council_member', 'user'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' }); // Erro 400 se o perfil for inválido
    
    // Verificação de limites de privilégio: Apenas administradores do sistema podem criar perfis com cargo de admin ou coordenador
    if (req.user.role !== 'admin' && (role === 'admin' || role === 'coordinator')) {
      return res.status(403).json({ error: 'Apenas administradores podem atribuir a função de administrador ou coordenador.' });
    }

    // Impede o registo de contas com e-mails que já se encontrem em uso no sistema
    const exists = await User.findOne({ email: email?.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already in use' }); // Erro de conflito (409)
    
    // Encripta a password do utilizador com salt-rounds de 10
    const hashed = await bcrypt.hash(password, 10);
    // Cria o registo na base de dados
    const user = await User.create({ name, email, password: hashed, role });
    // Retorna a informação da conta criada
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/users/:id
// Atualiza dados gerais de um utilizador específico, respeitando barreiras de privilégio
exports.updateUser = async (req, res) => {
  try {
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ error: 'User not found' }); // Erro 404 se não existir

    // Verificação de limites de privilégio: Coordenadores não podem alterar contas de administradores/coordenadores ou dar esses privilégios
    if (req.user.role !== 'admin') {
      if (existingUser.role === 'admin' || existingUser.role === 'coordinator') {
        return res.status(403).json({ error: 'Apenas administradores podem modificar utilizadores administradores ou coordenadores.' });
      }
      if (req.body.role && (req.body.role === 'admin' || req.body.role === 'coordinator')) {
        return res.status(403).json({ error: 'Apenas administradores podem atribuir a função de administrador ou coordenador.' });
      }
    }

    // Executa a atualização com os dados fornecidos no body do pedido
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'User updated' }); // Confirmação de alteração concluída
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/users/:id/status
// Altera o estado (ativo/inativo) de um utilizador específico
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ error: 'Invalid status' }); // Valida se o novo estado é válido

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ error: 'User not found' }); // Retorna 404 se não encontrado

    // Verificação de limites: Apenas administradores do sistema podem ativar/desativar contas de admin ou coordenadores
    if (req.user.role !== 'admin' && (existingUser.role === 'admin' || existingUser.role === 'coordinator')) {
      return res.status(403).json({ error: 'Apenas administradores podem alterar o estado de utilizadores administradores ou coordenadores.' });
    }

    // Atualiza o estado de atividade do utilizador
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: 'User status updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/activities
// Obtém lista de atividades para administração com populate do projeto e contagem de inscritos
exports.getActivities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status; // Filtro opcional por estado
    const activities = await Activity.find(filter).populate('project', 'name'); // Preenche apenas o nome do projeto relacionado
    
    // Mapeia e junta a contagem de participantes inscritos para cada atividade
    const data = await Promise.all(activities.map(async a => ({
      ...a.toObject(),
      id: a._id,
      participants_count: await ActivityParticipant.countDocuments({ activity: a._id }),
    })));
    res.json({ data }); // Envia resposta JSON
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/activities
// Cria uma atividade de gestão a partir do formulário administrativo
exports.createActivity = async (req, res) => {
  try {
    const { name, description, start_date, end_date, location, project_id, area, visibility, resources } = req.body;
    // Cria o documento de atividade com o ID do utilizador autenticado como criador
    const act = await Activity.create({
      name, description, location, project: project_id,
      startDate: start_date, endDate: end_date || start_date,
      areas: area ? [area] : [],
      resources,
      visibility: visibility || 'public', createdBy: req.user._id,
    });
    res.status(201).json({ id: act._id, status: act.status }); // Retorna o ID criado e estado inicial
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/activities/:id
// Atualiza dados e campos de uma atividade específica
exports.updateActivity = async (req, res) => {
  try {
    // Procura por ID e aplica as alterações do body
    const act = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity updated' }); // Retorna sucesso
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/activities/:id/status
// Efetua transições de estado controladas de uma atividade (planeada -> ativa -> concluída)
exports.updateActivityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Dicionário de transições permitidas (ex: de 'planned' só pode passar para 'active')
    const transitions = { planned: ['active'], active: ['completed'], completed: [] };
    const act = await Activity.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    
    // Bloqueia transições inválidas na lógica do ciclo de vida da atividade
    if (!transitions[act.status]?.includes(status))
      return res.status(400).json({ error: `Invalid status transition: ${act.status} → ${status}` });
    
    act.status = status; // Altera o estado
    await act.save(); // Salva as alterações
    res.json({ message: 'Activity status updated', status }); // Confirmação
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/report
// Obtém dados quantitativos simplificados para exibição de relatórios
exports.getReport = async (req, res) => {
  try {
    // Efetua queries paralelas para obter somatórios globais
    const [total, completed, participants, meetings, projects] = await Promise.all([
      Activity.countDocuments(),
      Activity.countDocuments({ status: 'completed' }),
      ActivityParticipant.countDocuments(),
      Meeting.countDocuments({ deletedAt: null }),
      Project.countDocuments(),
    ]);
    // Calcula taxa percentual de atividades engajadas (completadas)
    const engagement = total ? `${Math.round((completed / total) * 100)}%` : '0%';
    res.json({ total_activities: total, completed_activities: completed, participants, meetings, engagement_rate: engagement, projects });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/report
// Simulação de geração de relatórios de atividade em ficheiro (PDF, Excel, etc.)
exports.generateReport = async (req, res) => {
  try {
    const { type } = req.body;
    // Retorna mensagem simulando geração de ficheiro com sucesso
    res.json({ message: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Total'} report generated successfully` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
