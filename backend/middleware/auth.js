const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verifies the JWT from Authorization header.
 * Sets req.user on success.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.user_id, {
      attributes: { exclude: ['password'] },
    });
    if (!user)   return res.status(401).json({ error: 'User not found' });
    if (user.status === 'inactive')
      return res.status(403).json({ error: 'Account is inactive' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional auth – attaches user if token exists but doesn't fail if missing.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.user_id, { attributes: { exclude: ['password'] } });
    if (user && user.status === 'active') req.user = user;
  } catch { /* ignore */ }
  next();
};

module.exports = { authenticate, optionalAuth };
