const path   = require('path'); // Importa o módulo nativo path para manipular caminhos de ficheiros
const fs     = require('fs'); // Importa o módulo nativo fs para operações no sistema de ficheiros
const { Backup } = require('../models'); // Importa o modelo de Backup do Mongoose

// POST /api/admin/backups
// Cria um novo backup JSON simulado e guarda os metadados na base de dados
exports.createBackup = async (req, res) => {
  try {
    const { description } = req.body;
    const fileName = `backup_${Date.now()}.json`; // Cria um nome único com base no timestamp
    const backupDir = path.join(__dirname, '..', 'backups'); // Define o diretório de destino do backup
    fs.mkdirSync(backupDir, { recursive: true }); // Garante que a pasta de backups existe
    const filePath = path.join(backupDir, fileName); // Define o caminho absoluto final do ficheiro
    
    // Escreve informação básica no ficheiro de backup JSON simulado
    fs.writeFileSync(filePath, JSON.stringify({ created: new Date().toISOString(), note: 'EcoGest MongoDB Backup' }));

    // Regista o backup na base de dados guardando o tamanho em bytes e o autor
    const backup = await Backup.create({
      fileName,
      filePath,
      size: `${fs.statSync(filePath).size} B`, // Obtém o tamanho em bytes a partir das propriedades do ficheiro físico
      description: description || 'Manual backup',
      createdBy: req.user?._id || null, // Associa ao administrador autenticado
    });
    res.status(201).json({ id: backup._id, createdAt: backup.createdAt }); // Retorna sucesso com o ID do backup
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/backups
// Lista os backups existentes ordenados do mais recente para o mais antigo, com filtro de data opcional
exports.getBackups = async (req, res) => {
  try {
    const filter = {}; // Filtros da pesquisa
    // Filtra backups criados a partir de uma data específica se fornecida
    if (req.query.date) filter.createdAt = { $gte: new Date(req.query.date) };
    const backups = await Backup.find(filter).sort({ createdAt: -1 }); // Ordena por data de criação decrescente
    res.json({ data: backups }); // Retorna a lista dos backups
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/backups/:id/restore
// Executa o restauro simulado do sistema a partir de um backup específico
exports.restoreBackup = async (req, res) => {
  try {
    const { confirm } = req.body;
    // Exige confirmação explícita no body do pedido para evitar ações acidentais
    if (!confirm) return res.status(400).json({ error: 'Confirmation required' });
    const backup = await Backup.findById(req.params.id); // Procura os metadados do backup na BD
    if (!backup) return res.status(404).json({ error: 'Backup not found' }); // Retorna 404 se não existir
    res.json({ message: 'System restored successfully' }); // Retorna sucesso simulado
  } catch (e) { res.status(500).json({ error: e.message }); }
};
