const { Activity, ActivityParticipant, ActivityImage, Project } = require('../models'); // Importa os modelos necessários do Mongoose

// GET /api/activities
// Obtém a lista de atividades com filtros opcionais de pesquisa, área temática, datas de início e paginação
exports.getActivities = async (req, res) => {
  try {
    // Desestrutura os parâmetros de query recebidos no pedido
    const { search, area, date_from, date_to, page = 1, limit = 20 } = req.query;
    const filter = {}; // Objeto que irá armazenar os critérios de filtragem do Mongoose

    // Regra de visibilidade: Utilizadores não autenticados ou com perfil comum 'user' apenas podem ver atividades públicas
    if (!req.user || req.user.role === 'user') filter.visibility = 'public';
    // Se houver termo de pesquisa, filtra o nome da atividade por expressão regular (case-insensitive)
    if (search)  filter.name = new RegExp(search, 'i');
    // Se for especificada uma área temática, filtra as atividades por essa área
    if (area)    filter.areas = area;
    // Se for definido um intervalo de datas, filtra as atividades cuja data de início esteja nesse intervalo
    if (date_from && date_to)
      filter.startDate = { $gte: new Date(date_from), $lte: new Date(date_to) };

    // Realiza a consulta à base de dados aplicando filtros, população do projeto relacionado, ordenação e paginação
    const activities = await Activity.find(filter)
      .populate('project', 'name _id') // Preenche a referência do projeto associado com o nome e ID
      .sort({ startDate: 1 }) // Ordena as atividades por data de início de forma crescente
      .skip((page - 1) * parseInt(limit)) // Salta os registos correspondentes às páginas anteriores
      .limit(parseInt(limit)); // Limita o número de registos retornados

    const participationMap = {}; // Dicionário para mapear as participações do utilizador autenticado
    if (req.user) {
      // Se houver utilizador autenticado, obtém todas as suas inscrições em atividades
      const myParts = await ActivityParticipant.find({ user: req.user._id });
      // Preenche o mapa associando o ID da atividade ao ID da participação correspondente
      myParts.forEach(p => { participationMap[p.activity.toString()] = p._id; });
    }

    // Processa os dados de cada atividade obtida para adicionar contagem de participantes e o estado da participação do utilizador atual
    const data = await Promise.all(activities.map(async a => {
      const actId = a._id.toString();
      // Conta quantos participantes estão registados nesta atividade específica
      const count = await ActivityParticipant.countDocuments({ activity: a._id });
      return {
        id: a._id, name: a.name,
        start_date: a.startDate, end_date: a.endDate,
        location: a.location, status: a.status, visibility: a.visibility,
        project: a.project ? { project_id: a.project._id, name: a.project.name } : null,
        areas: a.areas,
        participants_count: count,
        // Informação se o utilizador está inscrito nesta atividade (se autenticado)
        user_participation: req.user ? {
          is_participating: !!participationMap[actId],
          participation_id: participationMap[actId] || null,
        } : null,
      };
    }));

    res.json({ data }); // Retorna a lista de dados estruturada no formato JSON
  } catch (e) { res.status(500).json({ error: e.message }); } // Retorna erro 500 caso ocorra uma exceção
};

// GET /api/activities/:id
// Obtém os detalhes completos de uma atividade específica identificada por ID
exports.getActivity = async (req, res) => {
  try {
    // Procura a atividade e faz populate do projeto e do utilizador criador
    const a = await Activity.findById(req.params.id)
      .populate('project') // Preenche a referência completa do projeto
      .populate('createdBy', 'name email'); // Preenche nome e email do utilizador criador
    if (!a) return res.status(404).json({ error: 'Activity not found' }); // Retorna erro 404 caso não seja encontrada

    // Conta o número total de participantes registados para esta atividade
    const participantsCount = await ActivityParticipant.countDocuments({ activity: a._id });
    // Obtém todas as imagens associadas à realização da atividade
    const images = await ActivityImage.find({ activity: a._id });

    // Retorna o objeto com toda a informação detalhada da atividade
    res.json({
      id: a._id, name: a.name, description: a.description,
      location: a.location, start_date: a.startDate, end_date: a.endDate,
      status: a.status, visibility: a.visibility, areas: a.areas,
      project: a.project, createdBy: a.createdBy,
      participants_count: participantsCount, images,
    });
  } catch (e) { res.status(500).json({ error: e.message }); } // Responde com erro em caso de falha de ligação ou query
};

// POST /api/activities/:id/participations
// Regista a participação de um utilizador autenticado ou convidado numa atividade ativa
exports.participate = async (req, res) => {
  try {
    // Procura a atividade correspondente
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' }); // Erro 404 se não existir
    // Garante que a atividade está ativa e a aceitar participantes
    if (activity.status !== 'active')
      return res.status(400).json({ error: 'Activity is not accepting participants' });

    if (req.user) {
      // Se for utilizador autenticado, impede a participação se a sua conta estiver inativa
      if (req.user.status === 'inactive')
        return res.status(403).json({ error: 'Account is inactive' });
      // Verifica se o utilizador já está inscrito nesta atividade
      const exists = await ActivityParticipant.findOne({ activity: req.params.id, user: req.user._id });
      if (exists) return res.status(409).json({ error: 'Already participating' }); // Erro de conflito (409)
      // Cria o registo de participação para o utilizador
      const p = await ActivityParticipant.create({ activity: req.params.id, user: req.user._id });
      return res.status(201).json({ id: p._id, message: 'Participation confirmed' }); // Retorna sucesso 201
    } else {
      // Se for participante convidado (não autenticado), exige nome e email
      const { name, email } = req.body;
      if (!name || !email)
        return res.status(400).json({ error: 'name and email required for guest participation' });
      // Verifica se o email do convidado já foi registado na mesma atividade
      const exists = await ActivityParticipant.findOne({ activity: req.params.id, guestEmail: email });
      if (exists) return res.status(409).json({ error: 'Email already registered for this activity' }); // Erro de conflito (409)
      // Cria o registo de participação externa para o convidado
      const p = await ActivityParticipant.create({ activity: req.params.id, guestName: name, guestEmail: email });
      return res.status(201).json({ id: p._id, message: 'Participation confirmed' }); // Retorna sucesso 201
    }
  } catch (e) { res.status(500).json({ error: e.message }); } // Captura e reporta erros de validação/base de dados
};

// DELETE /api/activities/:id/participations/:pid
// Permite que um utilizador autenticado cancele a sua inscrição numa atividade
exports.cancelParticipation = async (req, res) => {
  try {
    // Impede o cancelamento se a conta do utilizador estiver inativa
    if (!req.user || req.user.status === 'inactive')
      return res.status(403).json({ error: 'Account is inactive' });
    // Procura e elimina a participação correspondente garantindo que pertence ao próprio utilizador logado
    const p = await ActivityParticipant.findOneAndDelete({
      _id: req.params.pid, activity: req.params.id, user: req.user._id,
    });
    if (!p) return res.status(404).json({ error: 'Participation not found' }); // Retorna 404 se a participação não for encontrada ou não for do próprio
    res.json({ message: 'Participation cancelled' }); // Retorna sucesso na eliminação
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/activities/:id/participants
// Lista todos os participantes registados para uma determinada atividade
exports.listParticipants = async (req, res) => {
  try {
    // Procura as inscrições associadas à atividade e preenche dados básicos dos utilizadores internos associados
    const participants = await ActivityParticipant.find({ activity: req.params.id })
      .populate('user', 'name email _id');
    res.json({ data: participants }); // Retorna a lista obtida no formato JSON
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/participants
// Permite a um gestor (coordenador/membro do conselho) adicionar manualmente um participante à atividade
exports.addParticipant = async (req, res) => {
  try {
    const { name, email, user_id } = req.body;
    // Garante que a atividade existe na base de dados
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    // Cria o registo de participação associando o ID do utilizador (se fornecido) ou metadados de convidado
    const p = await ActivityParticipant.create({
      activity: req.params.id,
      user: user_id || null,
      guestName: name, guestEmail: email,
    });
    res.status(201).json({ message: 'Participant registered', id: p._id }); // Retorna a confirmação e ID do registo
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/executions
// Regista a finalização e os detalhes de execução prática de uma atividade
exports.registerExecution = async (req, res) => {
  try {
    // Obtém o registo da atividade a fechar
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    
    const { executionLocation, executionNotes } = req.body;
    activity.status = 'completed'; // Altera o estado da atividade para concluída
    if (executionLocation) activity.executionLocation = executionLocation; // Guarda a localização real da realização
    if (executionNotes)    activity.executionNotes = executionNotes; // Guarda relatórios/notas de execução
    
    await activity.save(); // Guarda as alterações na base de dados
    res.status(201).json({ message: 'Execution recorded', activity_id: activity._id }); // Confirmação com status 201
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/photos
// Associa um ficheiro de fotografia carregado à galeria de fotos de realização de uma atividade
exports.uploadPhoto = async (req, res) => {
  try {
    // Valida se o ficheiro foi realmente enviado pelo middleware Multer
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    // Cria a associação na base de dados guardando o caminho e o ID do autor do upload
    const image = await ActivityImage.create({
      activity: req.params.id,
      imageUrl: `/uploads/${req.file.filename}`, // Salva a rota relativa de acesso
      uploadedBy: req.user?._id || null, // Guarda utilizador autenticado que submeteu
    });
    res.status(201).json({ message: 'Photo uploaded', image }); // Responde com o objeto de imagem criado
  } catch (e) { res.status(500).json({ error: e.message }); }
};
