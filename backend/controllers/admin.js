const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Activity, ActivityParticipant, Proposal, Meeting, Report, Project } = require('../models');

// GET /admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [totalAct, plannedAct, activeAct, completedAct, participants, pendingProposals] =
      await Promise.all([
        Activity.count(), Activity.count({ where: { status: 'planned' } }),
        Activity.count({ where: { status: 'active' } }),
        Activity.count({ where: { status: 'completed' } }),
        ActivityParticipant.count(),
        Proposal.count({ where: { status: 'pending' } }),
      ]);
    res.json({
      activities: { total: totalAct, planned: plannedAct, active: activeAct, completed: completedAct },
      participants, proposals: { pending: pendingProposals },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /admin/users
exports.getUsers = async (req, res) => {
  try {
    const where = {};
    if (req.query.role)   where.role   = req.query.role;
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) where.name   = { [Op.like]: `%${req.query.search}%` };
    const users = await User.findAll({ where, attributes: { exclude: ['password'] } });
    res.json({ data: users });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /admin/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const validRoles = ['admin', 'coordinator', 'secretary', 'council_member', 'user'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ id: user.user_id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { name, email, role } = req.body;
    await user.update({ name, email, role });
    res.json({ message: 'User updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    await user.update({ status });
    res.json({ message: 'User status updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /admin/activities
exports.getActivities = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const activities = await Activity.findAll({ where, include: [{ model: ActivityParticipant, as: 'participations', attributes: ['id'] }] });
    res.json({ data: activities.map(a => ({ ...a.toJSON(), participants_count: a.participations.length })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /admin/activities
exports.createActivity = async (req, res) => {
  try {
    const { name, description, start_date, end_date, location, project_id, area, visibility } = req.body;
    const act = await Activity.create({ name, description, start_date, end_date, location, project_id, visibility: visibility || 'public', created_by: req.user.user_id });
    if (area) {
      const { ActivityArea } = require('../models');
      await ActivityArea.create({ activity_id: act.activity_id, area });
    }
    res.status(201).json({ id: act.activity_id, status: act.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /admin/activities/:id
exports.updateActivity = async (req, res) => {
  try {
    const act = await Activity.findByPk(req.params.id);
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    await act.update(req.body);
    res.json({ message: 'Activity updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /admin/activities/:id/status
exports.updateActivityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transitions = { planned: ['active'], active: ['completed'], completed: [] };
    const act = await Activity.findByPk(req.params.id);
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    if (!transitions[act.status]?.includes(status))
      return res.status(400).json({ error: `Invalid status transition: ${act.status} → ${status}` });
    await act.update({ status });
    res.json({ message: 'Activity status updated', status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /admin/report
exports.getReport = async (req, res) => {
  try {
    const [total, completed, participants, meetings, projects] = await Promise.all([
      Activity.count(), Activity.count({ where: { status: 'completed' } }),
      ActivityParticipant.count(), Meeting.count({ where: { deleted_at: null } }), Project.count(),
    ]);
    const engagement = total ? `${Math.round((completed / total) * 100)}%` : '0%';
    res.json({ total_activities: total, completed_activities: completed, participants, meetings, engagement_rate: engagement, projects });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /admin/report
exports.generateReport = async (req, res) => {
  try {
    // TODO: Generate PDF with a library like pdfkit or puppeteer
    res.json({ message: 'Report generated successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
