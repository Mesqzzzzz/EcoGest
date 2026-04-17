const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User, AuthLog } = require('../models');

const signToken = (user) =>
  jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /users — Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed });

    return res.status(201).json({
      message: 'User created successfully',
      data: { id: user.user_id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /users/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    const ok = user && await bcrypt.compare(password, user.password);
    await AuthLog.create({
      user_id: user?.user_id, action: ok ? 'login' : 'failed_login',
      success: !!ok, ip_address: req.ip, device_info: req.headers['user-agent'],
    });

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status === 'inactive') return res.status(403).json({ error: 'Account is inactive' });

    const token = signToken(user);
    return res.json({ token, user: { id: user.user_id, email: user.email, role: user.role, name: user.name } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /users/me
exports.getMe = async (req, res) => {
  const u = req.user;
  res.json({ id: u.user_id, name: u.name, email: u.email, role: u.role, status: u.status });
};

// PATCH /users/me
exports.updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};
    if (name)  updates.name  = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    await req.user.update(updates);
    res.json({ message: 'Profile updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /users/me/status
exports.updateMyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ error: 'status must be active or inactive' });
    await req.user.update({ status });
    res.json({ message: 'Status updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
