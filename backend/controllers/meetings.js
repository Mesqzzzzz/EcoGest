const { Meeting, MeetingDocument } = require('../models');

// GET /api/meetings
exports.getMeetings = async (req, res) => {
  try {
    const filter = { deletedAt: null };
    if (req.query.project_id) filter.project = req.query.project_id;
    if (req.query.date) filter.date = new Date(req.query.date);
    const meetings = await Meeting.find(filter).sort({ date: 1 });
    res.json({ data: meetings });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/meetings/:id
exports.getMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    const documents = await MeetingDocument.find({ meeting: m._id });
    res.json({ ...m.toObject(), documents });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/meetings
exports.createMeeting = async (req, res) => {
  try {
    const { name, date, description, project_id } = req.body;
    if (!name || !date || !project_id)
      return res.status(400).json({ error: 'name, date and project_id required' });
    const m = await Meeting.create({ name, date: new Date(date), description, project: project_id });
    res.status(201).json({ id: m._id, date: m.date });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/meetings/:id
exports.updateMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    const { name, date, description } = req.body;
    if (name) m.name = name;
    if (date) m.date = new Date(date);
    if (description) m.description = description;
    await m.save();
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /api/meetings/:id (soft delete)
exports.deleteMeeting = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    m.deletedAt = new Date();
    await m.save();
    res.json({ message: 'Meeting deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/meetings/:id/convocations
exports.sendConvocations = async (req, res) => {
  try {
    const m = await Meeting.findOne({ _id: req.params.id, deletedAt: null });
    if (!m) return res.status(404).json({ error: 'Meeting not found' });
    if (!m.date) return res.status(400).json({ error: 'Meeting date missing' });
    res.json({ message: 'Convocations sent successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/meetings/:id/documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await MeetingDocument.find({ meeting: req.params.id });
    res.json({ data: docs });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/meetings/:id/documents
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const doc = await MeetingDocument.create({
      meeting: req.params.id, name: req.file.originalname,
      documentUrl: `/uploads/${req.file.filename}`,
      type: req.body.type || 'other', uploadedBy: req.user?._id || null,
    });
    res.status(201).json({ message: 'Document uploaded', document: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await MeetingDocument.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
