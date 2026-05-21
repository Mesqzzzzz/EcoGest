const bcrypt = require('bcryptjs');
const { User, Activity, ActivityParticipant, Proposal, Meeting, Project, ActivityImage } = require('../models');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [totalAct, plannedAct, activeAct, completedAct, participants, pendingProposals] =
      await Promise.all([
        Activity.countDocuments(),
        Activity.countDocuments({ status: 'planned' }),
        Activity.countDocuments({ status: 'active' }),
        Activity.countDocuments({ status: 'completed' }),
        ActivityParticipant.countDocuments(),
        Proposal.countDocuments({ status: 'pending' }),
      ]);

    // Incentivos MoM - ultimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [completedActivitiesLast6Months, imagesLast6Months] = await Promise.all([
      Activity.find({ status: 'completed', updatedAt: { $gte: sixMonthsAgo } }),
      ActivityImage.find({ createdAt: { $gte: sixMonthsAgo } }),
    ]);

    const monthlyStats = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleString('en-US', { month: 'short' });
      const ptLabel = d.toLocaleString('pt-PT', { month: 'short' });

      const actsCount = completedActivitiesLast6Months.filter(a => {
        const u = new Date(a.updatedAt);
        return u.getFullYear() === year && u.getMonth() === month;
      }).length;

      const photosCount = imagesLast6Months.filter(img => {
        const c = new Date(img.createdAt);
        return c.getFullYear() === year && c.getMonth() === month;
      }).length;

      monthlyStats.push({
        label,
        ptLabel,
        year,
        month: month + 1,
        completedActivities: actsCount,
        photosCollected: photosCount
      });
    }

    res.json({
      activities: { total: totalAct, planned: plannedAct, active: activeAct, completed: completedAct },
      participants,
      proposals: { pending: pendingProposals },
      monthlyStats
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role)   filter.role   = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.name   = new RegExp(req.query.search, 'i');
    const users = await User.find(filter).select('-password');
    res.json({ data: users });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const validRoles = ['admin', 'coordinator', 'secretary', 'council_member', 'user'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    
    // Boundary check: Only admin can assign coordinator or admin role
    if (req.user.role !== 'admin' && (role === 'admin' || role === 'coordinator')) {
      return res.status(403).json({ error: 'Apenas administradores podem atribuir a função de administrador ou coordenador.' });
    }

    const exists = await User.findOne({ email: email?.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ error: 'User not found' });

    // Boundary check: Non-admins cannot touch admin/coordinator accounts or assign those roles
    if (req.user.role !== 'admin') {
      if (existingUser.role === 'admin' || existingUser.role === 'coordinator') {
        return res.status(403).json({ error: 'Apenas administradores podem modificar utilizadores administradores ou coordenadores.' });
      }
      if (req.body.role && (req.body.role === 'admin' || req.body.role === 'coordinator')) {
        return res.status(403).json({ error: 'Apenas administradores podem atribuir a função de administrador ou coordenador.' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'User updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ error: 'User not found' });

    // Boundary check: Non-admins cannot alter the status of admin/coordinator accounts
    if (req.user.role !== 'admin' && (existingUser.role === 'admin' || existingUser.role === 'coordinator')) {
      return res.status(403).json({ error: 'Apenas administradores podem alterar o estado de utilizadores administradores ou coordenadores.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: 'User status updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/activities
exports.getActivities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const activities = await Activity.find(filter).populate('project', 'name');
    const data = await Promise.all(activities.map(async a => ({
      ...a.toObject(),
      id: a._id,
      participants_count: await ActivityParticipant.countDocuments({ activity: a._id }),
    })));
    res.json({ data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/activities
exports.createActivity = async (req, res) => {
  try {
    const { name, description, start_date, end_date, location, project_id, area, visibility, resources } = req.body;
    const act = await Activity.create({
      name, description, location, project: project_id,
      startDate: start_date, endDate: end_date || start_date,
      areas: area ? [area] : [],
      resources,
      visibility: visibility || 'public', createdBy: req.user._id,
    });
    res.status(201).json({ id: act._id, status: act.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/activities/:id
exports.updateActivity = async (req, res) => {
  try {
    const act = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/admin/activities/:id/status
exports.updateActivityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transitions = { planned: ['active'], active: ['completed'], completed: [] };
    const act = await Activity.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    if (!transitions[act.status]?.includes(status))
      return res.status(400).json({ error: `Invalid status transition: ${act.status} → ${status}` });
    act.status = status;
    await act.save();
    res.json({ message: 'Activity status updated', status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/admin/report
exports.getReport = async (req, res) => {
  try {
    const [total, completed, participants, meetings, projects] = await Promise.all([
      Activity.countDocuments(),
      Activity.countDocuments({ status: 'completed' }),
      ActivityParticipant.countDocuments(),
      Meeting.countDocuments({ deletedAt: null }),
      Project.countDocuments(),
    ]);
    const engagement = total ? `${Math.round((completed / total) * 100)}%` : '0%';
    res.json({ total_activities: total, completed_activities: completed, participants, meetings, engagement_rate: engagement, projects });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/admin/report
exports.generateReport = async (req, res) => {
  try {
    const { type } = req.body;
    res.json({ message: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Total'} report generated successfully` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
