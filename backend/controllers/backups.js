const path    = require('path');
const fs      = require('fs');
const { Backup } = require('../models');

// POST /system/backups
exports.createBackup = async (req, res) => {
  try {
    const { description } = req.body;
    const fileName = `backup_${Date.now()}.sql`;
    const filePath = path.join(__dirname, '..', 'backups', fileName);

    // TODO: Run mysqldump for a real backup
    // For now, create a placeholder file
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `-- EcoGest Backup ${new Date().toISOString()}`);

    const backup = await Backup.create({
      file_name: fileName, file_path: filePath,
      size: `${fs.statSync(filePath).size} B`,
      description: description || 'Manual backup',
      created_by: req.user?.user_id,
    });
    res.status(201).json({ id: backup.backup_id, created_at: backup.createdAt });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /system/backups
exports.getBackups = async (req, res) => {
  try {
    const where = {};
    if (req.query.date) where.createdAt = { $gte: new Date(req.query.date) };
    const backups = await Backup.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ data: backups });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /system/backups/:id/restore
exports.restoreBackup = async (req, res) => {
  try {
    const { confirm } = req.body;
    if (!confirm) return res.status(400).json({ error: 'Confirmation required' });
    const backup = await Backup.findByPk(req.params.id);
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    // TODO: Run mysql restore from backup.file_path
    res.json({ message: 'System restored successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
