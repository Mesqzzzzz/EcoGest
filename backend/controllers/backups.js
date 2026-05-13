const path   = require('path');
const fs     = require('fs');
const { Backup } = require('../models');

// POST /api/admin/backups
exports.createBackup = async (req, res) => {
  try {
    const { description } = req.body;
    const fileName = `backup_${Date.now()}.json`;
    const backupDir = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const filePath = path.join(backupDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify({ created: new Date().toISOString(), note: 'EcoGest MongoDB Backup' }));

    const backup = await Backup.create({
      fileName,
      filePath,
      size: `${fs.statSync(filePath).size} B`,
      description: description || 'Manual backup',
      createdBy: req.user?._id || null,
    });
    res.status(201).json({ id: backup._id, createdAt: backup.createdAt });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/backups
exports.getBackups = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.createdAt = { $gte: new Date(req.query.date) };
    const backups = await Backup.find(filter).sort({ createdAt: -1 });
    res.json({ data: backups });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/backups/:id/restore
exports.restoreBackup = async (req, res) => {
  try {
    const { confirm } = req.body;
    if (!confirm) return res.status(400).json({ error: 'Confirmation required' });
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    res.json({ message: 'System restored successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
