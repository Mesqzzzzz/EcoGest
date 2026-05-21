const { Activity, ActivityParticipant, ActivityImage, Project } = require('../models');

// GET /api/activities
exports.getActivities = async (req, res) => {
  try {
    const { search, area, date_from, date_to, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Utilizadores não autenticados ou 'user' veem apenas atividades públicas
    if (!req.user || req.user.role === 'user') filter.visibility = 'public';
    if (search)  filter.name = new RegExp(search, 'i');
    if (area)    filter.areas = area;
    if (date_from && date_to)
      filter.startDate = { $gte: new Date(date_from), $lte: new Date(date_to) };

    const activities = await Activity.find(filter)
      .populate('project', 'name _id')
      .sort({ startDate: 1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const participationMap = {};
    if (req.user) {
      const myParts = await ActivityParticipant.find({ user: req.user._id });
      myParts.forEach(p => { participationMap[p.activity.toString()] = p._id; });
    }

    const data = await Promise.all(activities.map(async a => {
      const actId = a._id.toString();
      const count = await ActivityParticipant.countDocuments({ activity: a._id });
      return {
        id: a._id, name: a.name,
        start_date: a.startDate, end_date: a.endDate,
        location: a.location, status: a.status, visibility: a.visibility,
        project: a.project ? { project_id: a.project._id, name: a.project.name } : null,
        areas: a.areas,
        participants_count: count,
        user_participation: req.user ? {
          is_participating: !!participationMap[actId],
          participation_id: participationMap[actId] || null,
        } : null,
      };
    }));

    res.json({ data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/activities/:id
exports.getActivity = async (req, res) => {
  try {
    const a = await Activity.findById(req.params.id)
      .populate('project')
      .populate('createdBy', 'name email');
    if (!a) return res.status(404).json({ error: 'Activity not found' });

    const participantsCount = await ActivityParticipant.countDocuments({ activity: a._id });
    const images = await ActivityImage.find({ activity: a._id });

    res.json({
      id: a._id, name: a.name, description: a.description,
      location: a.location, start_date: a.startDate, end_date: a.endDate,
      status: a.status, visibility: a.visibility, areas: a.areas,
      project: a.project, createdBy: a.createdBy,
      participants_count: participantsCount, images,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/participations
exports.participate = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    if (activity.status !== 'active')
      return res.status(400).json({ error: 'Activity is not accepting participants' });

    if (req.user) {
      if (req.user.status === 'inactive')
        return res.status(403).json({ error: 'Account is inactive' });
      const exists = await ActivityParticipant.findOne({ activity: req.params.id, user: req.user._id });
      if (exists) return res.status(409).json({ error: 'Already participating' });
      const p = await ActivityParticipant.create({ activity: req.params.id, user: req.user._id });
      return res.status(201).json({ id: p._id, message: 'Participation confirmed' });
    } else {
      const { name, email } = req.body;
      if (!name || !email)
        return res.status(400).json({ error: 'name and email required for guest participation' });
      const exists = await ActivityParticipant.findOne({ activity: req.params.id, guestEmail: email });
      if (exists) return res.status(409).json({ error: 'Email already registered for this activity' });
      const p = await ActivityParticipant.create({ activity: req.params.id, guestName: name, guestEmail: email });
      return res.status(201).json({ id: p._id, message: 'Participation confirmed' });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// DELETE /api/activities/:id/participations/:pid
exports.cancelParticipation = async (req, res) => {
  try {
    if (!req.user || req.user.status === 'inactive')
      return res.status(403).json({ error: 'Account is inactive' });
    const p = await ActivityParticipant.findOneAndDelete({
      _id: req.params.pid, activity: req.params.id, user: req.user._id,
    });
    if (!p) return res.status(404).json({ error: 'Participation not found' });
    res.json({ message: 'Participation cancelled' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/activities/:id/participants
exports.listParticipants = async (req, res) => {
  try {
    const participants = await ActivityParticipant.find({ activity: req.params.id })
      .populate('user', 'name email _id');
    res.json({ data: participants });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/participants
exports.addParticipant = async (req, res) => {
  try {
    const { name, email, user_id } = req.body;
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    const p = await ActivityParticipant.create({
      activity: req.params.id,
      user: user_id || null,
      guestName: name, guestEmail: email,
    });
    res.status(201).json({ message: 'Participant registered', id: p._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/executions
exports.registerExecution = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    
    const { executionLocation, executionNotes } = req.body;
    activity.status = 'completed';
    if (executionLocation) activity.executionLocation = executionLocation;
    if (executionNotes)    activity.executionNotes = executionNotes;
    
    await activity.save();
    res.status(201).json({ message: 'Execution recorded', activity_id: activity._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/activities/:id/photos
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const image = await ActivityImage.create({
      activity: req.params.id,
      imageUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user?._id || null,
    });
    res.status(201).json({ message: 'Photo uploaded', image });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
