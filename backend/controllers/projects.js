const { Project, User, Activity } = require('../models');

const calculateProjectLevel = async (project) => {
  const activities = await Activity.find({ project: project._id });
  const uniqueAreas = new Set();
  activities.forEach(a => {
    if (a.areas && Array.isArray(a.areas)) {
      a.areas.forEach(ar => uniqueAreas.add(ar));
    }
  });

  const totalAct = activities.length;
  const totalAreas = uniqueAreas.size;

  let computedLevel = null;
  if (totalAct >= 8 && totalAreas >= 4) {
    computedLevel = 'gold';
  } else if (totalAct >= 4 && totalAreas >= 2) {
    computedLevel = 'silver';
  } else if (totalAct >= 1) {
    computedLevel = 'bronze';
  }

  if (project.level !== computedLevel) {
    project.level = computedLevel;
    await project.save();
  }

  return { level: computedLevel, activitiesCount: totalAct, areasCount: totalAreas };
};

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.year)   filter.year   = parseInt(req.query.year);

    const projects = await Project.find(filter)
      .populate('coordinator', 'name email _id');

    const data = await Promise.all(projects.map(async p => {
      const stats = await calculateProjectLevel(p);
      return {
        id: p._id, name: p.name, year: p.year, status: p.status, 
        level: stats.level, coordinator: p.coordinator,
        activitiesCount: stats.activitiesCount,
        areasCount: stats.areasCount,
      };
    }));

    res.json({ data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const p = await Project.findById(req.params.id)
      .populate('coordinator', 'name email _id');
    if (!p) return res.status(404).json({ error: 'Project not found' });
    
    const stats = await calculateProjectLevel(p);
    res.json({ 
      id: p._id, name: p.name, year: p.year, status: p.status, 
      level: stats.level, coordinator: p.coordinator,
      activitiesCount: stats.activitiesCount,
      areasCount: stats.areasCount
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, year, level } = req.body;
    const exists = await Project.findOne({ year: parseInt(year) });
    if (exists) return res.status(409).json({ error: 'Project for this year already exists' });
    const p = await Project.create({ name, year: parseInt(year), level: level || null });
    res.status(201).json({ id: p._id, status: p.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json({ id: p._id, name: p.name, year: p.year, status: p.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/projects/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transitions = { planning: ['active'], active: ['finished'], finished: [] };
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    if (!transitions[p.status]?.includes(status))
      return res.status(400).json({ error: `Invalid transition: ${p.status} → ${status}` });
    if (status === 'active' && !p.coordinator)
      return res.status(400).json({ error: 'Coordinator not assigned' });
    p.status = status;
    await p.save();
    res.json({ status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/projects/:id/coordinator
exports.assignCoordinator = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findById(user_id);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (!['coordinator', 'admin'].includes(user.role))
      return res.status(400).json({ error: 'User is not a coordinator' });
    const p = await Project.findByIdAndUpdate(req.params.id, { coordinator: user_id }, { new: true });
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Coordinator assigned' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
