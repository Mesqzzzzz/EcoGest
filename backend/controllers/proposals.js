const { Proposal, Activity } = require('../models');

// GET /api/proposals
exports.getProposals = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'council_member') filter.createdBy = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const proposals = await Proposal.find(filter)
      .populate('createdBy', 'name email _id')
      .sort({ createdAt: -1 });
    res.json({ data: proposals });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/proposals/:id
exports.getProposal = async (req, res) => {
  try {
    const p = await Proposal.findById(req.params.id).populate('createdBy', 'name _id');
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    if (req.user.role === 'council_member' && !p.createdBy._id.equals(req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/proposals
exports.createProposal = async (req, res) => {
  try {
    const { title, description, area, start_date, end_date, resources, project_id } = req.body;
    if (!title || !project_id)
      return res.status(400).json({ error: 'title and project_id required' });
    const p = await Proposal.create({
      title, description, area,
      startDate: start_date, endDate: end_date,
      resources, project: project_id, createdBy: req.user._id,
    });
    res.status(201).json({ id: p._id, status: p.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/proposals/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, review_note } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });
    const p = await Proposal.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    p.status = status; p.reviewedBy = req.user._id; p.reviewNote = review_note;
    await p.save();
    if (status === 'approved') {
      const act = await Activity.create({
        project: p.project, name: p.title, description: p.description,
        startDate: p.startDate, endDate: p.endDate,
        areas: p.area ? [p.area] : [],
        status: 'planned', visibility: 'public', createdBy: req.user._id,
      });
      return res.json({ message: 'Proposal approved and activity created', activity_id: act._id });
    }
    res.json({ message: `Proposal ${status}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
