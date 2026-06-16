const { Meeting, MeetingDocument } = require('../models'); // Importa os modelos necessários do Mongoose

// GET /api/meetings
// Lista todas as reuniões ativas (não eliminadas) filtrando opcionalmente por projeto ou data
exports.getMeetings = async (req, res) => {
  try {
    const filter = { deletedAt: null }; // Filtro base para ignorar reuniões eliminadas logicamente
    if (req.query.project_id) filter.project = req.query.project_id; // Filtro opcional por ID do projeto
    if (req.query.date) filter.date = new Date(req.query.date); // Filtro opcional por data específica
    const meetings = await Meeting.find(filter).sort({ date: 1 }); // Ordena as reuniões por data ascendente
    res.json({ data: meetings }); // Retorna a lista obtida
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/meetings/:id
// Obtém detalhes de uma reunião ativa e carrega a lista de documentos/atas associados a esta
exports.getMeeting = async (req, res) => {
  try {
    // Procura reunião correspondente por ID garantindo que não está marcada como eliminada
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' }); // Retorna 404 se não for encontrada
    // Obtém todos os documentos associados à reunião
    const documents = await MeetingDocument.find({ meeting: m._id });
    res.json({ ...m.toObject(), documents }); // Retorna a união do objeto da reunião com a lista de documentos
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/meetings
// Cria e agenda uma nova reunião de conselho
exports.createMeeting = async (req, res) => {
  try {
    const { name, date, description, project_id } = req.body;
    // Validação obrigatória dos campos básicos
    if (!name || !date || !project_id)
      return res.status(400).json({ error: 'name, date and project_id required' });
    // Cria o documento de reunião
    const m = await Meeting.create({ name, date: new Date(date), description, project: project_id });
    res.status(201).json({ id: m._id, date: m.date }); // Retorna o ID gerado e data formatada
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/meetings/:id
// Atualiza dados e campos específicos de uma reunião ativa
exports.updateMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    const { name, date, description } = req.body;
    // Aplica alterações de forma incremental se fornecidas
    if (name) m.name = name;
    if (date) m.date = new Date(date);
    if (description) m.description = description;
    await m.save(); // Salva as alterações
    res.json(m); // Retorna o objeto da reunião atualizado
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /api/meetings/:id (soft delete)
// Efetua a eliminação lógica de uma reunião marcando o campo deletedAt
exports.deleteMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    m.deletedAt = new Date(); // Grava a data e hora atual como indicador de eliminação lógica
    await m.save(); // Salva as alterações
    res.json({ message: 'Meeting deleted' }); // Retorna mensagem de confirmação
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/meetings/:id/convocations
// Simulação de envio automático de convocações aos membros do conselho via email
exports.sendConvocations = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    if (!m.date) return res.status(400).json({ error: 'Meeting date missing' });
    res.json({ message: 'Convocations sent successfully' }); // Retorna resposta simulada de sucesso
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/meetings/:id/documents
// Obtém a lista completa de documentos carregados de uma reunião
exports.getDocuments = async (req, res) => {
  try {
    const docs = await MeetingDocument.find({ meeting: req.params.id }); // Obtém os documentos associados
    res.json({ data: docs }); // Retorna os documentos
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/meetings/:id/documents
// Associa um ficheiro carregado (como ata ou convocatória) aos documentos de uma reunião
exports.uploadDocument = async (req, res) => {
  try {
    // Valida se o ficheiro foi realmente enviado
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    // Cria o registo do documento guardando o caminho e o ID do autor do upload
    const doc = await MeetingDocument.create({
      meeting: req.params.id, name: req.file.originalname,
      documentUrl: `/uploads/${req.file.filename}`, // Salva a rota relativa de acesso
      type: req.body.type || 'other', // Tipo de ficheiro (ex: agenda, minutes, other)
      uploadedBy: req.user?._id || null, // Guarda utilizador autenticado que submeteu
    });
    res.status(201).json({ message: 'Document uploaded', document: doc }); // Responde com o objeto criado
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /api/documents/:id
// Apaga o registo de um documento específico pelo ID do documento
exports.deleteDocument = async (req, res) => {
  try {
    // Procura e remove o documento físico da base de dados (hard delete)
    const doc = await MeetingDocument.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document removed' }); // Retorna sucesso
  } catch (e) { res.status(500).json({ error: e.message }); }
};
