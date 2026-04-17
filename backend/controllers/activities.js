const { Op } = require('sequelize');
const { Activity, ActivityArea, ActivityParticipant, ActivityImage, Project, User } = require('../models');
const path   = require('path');

// GET /activities
exports.getActivities = async (req, res) => {
  try {
    const { search, area, date_from, date_to, page = 1, limit = 20 } = req.query;
    const where = {};
    // Public listing: only show public+active unless authenticated
    if (!req.user || req.user.role === 'user') where.visibility = 'public';
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (date_from && date_to) where.start_date = { [Op.between]: [date_from, date_to] };

    const activities = await Activity.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['project_id', 'name'] },
        { model: ActivityArea, as: 'areas' },
        { model: ActivityParticipant, as: 'participations', attributes: ['id'] },
      ],
      order: [['start_date', 'ASC']],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit),
    });

    const data = activities
      .filter(a => !area || a.areas.some(ar => ar.area === area))
      .map(a => ({
        id: a.activity_id, name: a.name, start_date: a.start_date, end_date: a.end_date,
        location: a.location, status: a.status, visibility: a.visibility,
        project: a.project, areas: a.areas.map(ar => ar.area),
        participants_count: a.participations.length,
        user_participation: req.user
          ? {
              is_participating: a.participations.some(p => p.user_id === req.user.user_id),
              participation_id: a.participations.find(p => p.user_id === req.user.user_id)?.id || null,
            }
          : null,
      }));
    res.json({ data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /activities/:id
exports.getActivity = async (req, res) => {
  try {
    const a = await Activity.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: ActivityArea, as: 'areas' },
        { model: ActivityParticipant, as: 'participations' },
        { model: ActivityImage, as: 'images' },
      ],
    });
    if (!a) return res.status(404).json({ error: 'Activity not found' });
    res.json({ ...a.toJSON(), areas: a.areas.map(ar => ar.area), participants_count: a.participations.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /activities/:id/participations
exports.participate = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    if (activity.status !== 'active') return res.status(400).json({ error: 'Activity is not accepting participants' });

    if (req.user) {
      // Authenticated user
      if (req.user.status === 'inactive') return res.status(403).json({ error: 'Account is inactive' });
      const exists = await ActivityParticipant.findOne({ where: { activity_id: req.params.id, user_id: req.user.user_id } });
      if (exists) return res.status(409).json({ error: 'Already participating' });
      const p = await ActivityParticipant.create({ activity_id: req.params.id, user_id: req.user.user_id });
      return res.status(201).json({ id: p.id, message: 'Participation confirmed' });
    } else {
      // Guest
      const { name, email } = req.body;
      if (!name || !email) return res.status(400).json({ error: 'name and email required for guest participation' });
      const exists = await ActivityParticipant.findOne({ where: { activity_id: req.params.id, guest_email: email } });
      if (exists) return res.status(409).json({ error: 'Email already registered for this activity' });
      const p = await ActivityParticipant.create({ activity_id: req.params.id, guest_name: name, guest_email: email });
      return res.status(201).json({ id: p.id, message: 'Participation confirmed' });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /activities/:id/participations/:pid
exports.cancelParticipation = async (req, res) => {
  try {
    if (!req.user || req.user.status === 'inactive')
      return res.status(403).json({ error: 'Account is inactive' });
    const p = await ActivityParticipant.findOne({
      where: { id: req.params.pid, activity_id: req.params.id, user_id: req.user.user_id },
    });
    if (!p) return res.status(404).json({ error: 'Participation not found' });
    await p.destroy();
    res.json({ message: 'Participation cancelled' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /activities/:id/participants (coordinator/council)
exports.listParticipants = async (req, res) => {
  try {
    const participants = await ActivityParticipant.findAll({
      where: { activity_id: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['user_id', 'name', 'email'] }],
    });
    res.json({ data: participants });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /activities/:id/participants (coordinator manually adds)
exports.addParticipant = async (req, res) => {
  try {
    const { name, email, user_id } = req.body;
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    const p = await ActivityParticipant.create({
      activity_id: req.params.id,
      user_id: user_id || null,
      guest_name: name, guest_email: email,
    });
    res.status(201).json({ message: 'Participant registered', id: p.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /activities/:id/executions
exports.registerExecution = async (req, res) => {
  try {
    const { date, location, notes } = req.body;
    // Store execution as a SystemLog entry / or update the activity
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    await activity.update({ status: 'completed' });
    res.status(201).json({ message: 'Execution recorded', activity_id: activity.activity_id });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /activities/:id/photos
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const image = await ActivityImage.create({
      activity_id: req.params.id,
      image_url: `/uploads/${req.file.filename}`,
      uploaded_by: req.user?.user_id,
    });
    res.status(201).json({ message: 'Photo uploaded', image });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
