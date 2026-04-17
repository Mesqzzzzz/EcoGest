const { Project, ProjectArea, User } = require('../models');

// GET /projects
exports.getProjects = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.year)   where.year   = req.query.year;
    const projects = await Project.findAll({
      where, include: [
        { model: User, as: 'coordinator', attributes: ['user_id', 'name', 'email'] },
        { model: ProjectArea, as: 'areas' },
      ],
    });
    res.json({ data: projects });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /projects/:id
exports.getProject = async (req, res) => {
  try {
    const p = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'coordinator', attributes: ['user_id', 'name', 'email'] },
        { model: ProjectArea, as: 'areas' },
      ],
    });
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /projects
exports.createProject = async (req, res) => {
  try {
    const { name, year, level } = req.body;
    const exists = await Project.findOne({ where: { year } });
    if (exists) return res.status(409).json({ error: 'Project for this year already exists' });
    const p = await Project.create({ name, year, level_id: level });
    res.status(201).json({ id: p.project_id, status: p.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /projects/:id
exports.updateProject = async (req, res) => {
  try {
    const p = await Project.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    await p.update(req.body);
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /projects/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transitions = { planning: ['active'], active: ['finished'], finished: [] };
    const p = await Project.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    if (!transitions[p.status]?.includes(status))
      return res.status(400).json({ error: `Invalid transition: ${p.status} → ${status}` });
    if (status === 'active' && !p.coordinator_id)
      return res.status(400).json({ error: 'Coordinator not assigned' });
    await p.update({ status });
    res.json({ status });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /projects/:id/coordinator
exports.assignCoordinator = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findByPk(user_id);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (!['coordinator', 'admin'].includes(user.role))
      return res.status(400).json({ error: 'User is not a coordinator' });
    const p = await Project.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    await p.update({ coordinator_id: user_id });
    res.json({ message: 'Coordinator assigned' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
