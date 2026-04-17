const { Proposal, User } = require('../models');

// GET /proposals
exports.getProposals = async (req, res) => {
  try {
    const where = {};
    // Council members see only their own; coordinators see all
    if (req.user.role === 'council_member') where.created_by = req.user.user_id;
    if (req.query.status) where.status = req.query.status;

    const proposals = await Proposal.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['user_id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: proposals });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /proposals/:id
exports.getProposal = async (req, res) => {
  try {
    const p = await Proposal.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['user_id', 'name'] }],
    });
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    // Council members can only see their own
    if (req.user.role === 'council_member' && p.created_by !== req.user.user_id)
      return res.status(403).json({ error: 'Forbidden' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /proposals
exports.createProposal = async (req, res) => {
  try {
    const { title, description, area, start_date, end_date, resources, project_id } = req.body;
    if (!title || !project_id) return res.status(400).json({ error: 'title and project_id required' });
    const p = await Proposal.create({
      title, description, area, start_date, end_date, resources,
      project_id, created_by: req.user.user_id,
    });
    res.status(201).json({ id: p.proposal_id, status: p.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /admin/proposals/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, review_note } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });

    const p = await Proposal.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });

    await p.update({ status, reviewed_by: req.user.user_id, review_note });

    if (status === 'approved') {
      // Auto-create a planned activity from the approved proposal
      const { Activity, ActivityArea } = require('../models');
      const act = await Activity.create({
        project_id: p.project_id, name: p.title, description: p.description,
        start_date: p.start_date, end_date: p.end_date,
        status: 'planned', visibility: 'public', created_by: req.user.user_id,
      });
      if (p.area) await ActivityArea.create({ activity_id: act.activity_id, area: p.area });
      return res.json({ message: 'Proposal approved and activity created', activity_id: act.activity_id });
    }
    res.json({ message: `Proposal ${status}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
