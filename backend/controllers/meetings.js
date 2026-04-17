const { Meeting, MeetingDocument } = require('../models');

// GET /meetings
exports.getMeetings = async (req, res) => {
  try {
    const { project_id, date } = req.query;
    const where = { deleted_at: null };
    if (project_id) where.project_id = project_id;
    if (date) where.date = date;
    const meetings = await Meeting.findAll({ where, order: [['date', 'ASC']] });
    res.json({ data: meetings });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /meetings/:id
exports.getMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ where: { meeting_id: req.params.id, deleted_at: null }, include: [{ model: MeetingDocument, as: 'documents' }] });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /meetings
exports.createMeeting = async (req, res) => {
  try {
    const { name, date, description, project_id } = req.body;
    if (!name || !date || !project_id)
      return res.status(400).json({ error: 'name, date and project_id required' });
    const m = await Meeting.create({ name, date, description, project_id });
    res.status(201).json({ id: m.meeting_id, date: m.date });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /meetings/:id
exports.updateMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ where: { meeting_id: req.params.id, deleted_at: null } });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    const { name, date, description } = req.body;
    await m.update({ name, date, description });
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /meetings/:id (soft delete)
exports.deleteMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ where: { meeting_id: req.params.id, deleted_at: null } });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    await m.update({ deleted_at: new Date() });
    res.json({ message: 'Meeting deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /meetings/:id/convocations
exports.sendConvocations = async (req, res) => {
  try {
    const m = await Meeting.findOne({ where: { meeting_id: req.params.id, deleted_at: null } });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    if (!m.date) return res.status(400).json({ error: 'Meeting date missing' });
    // TODO: Integrate nodemailer here to send real emails
    res.json({ message: 'Convocations sent successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /meetings/:id/documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await MeetingDocument.findAll({ where: { meeting_id: req.params.id } });
    res.json({ data: docs });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /meetings/:id/documents
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const doc = await MeetingDocument.create({
      meeting_id: req.params.id, name: req.file.originalname,
      document_url: `/uploads/${req.file.filename}`,
      type: req.body.type || 'other', uploaded_by: req.user?.user_id,
    });
    res.status(201).json({ message: 'Document uploaded', document: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await MeetingDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    await doc.destroy();
    res.json({ message: 'Document removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
