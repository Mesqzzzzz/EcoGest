const jwt  = require('jsonwebtoken');
const { User } = require('../models');

/** Verifica o JWT e coloca req.user */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user)               return res.status(401).json({ error: 'User not found' });
    if (user.status === 'inactive')
      return res.status(403).json({ error: 'Account is inactive' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/** Auth opcional — anexa utilizador se token existir, mas não falha se não houver */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (user && user.status === 'active') req.user = user;
  } catch { /* ignorar */ }
  next();
};

module.exports = { authenticate, optionalAuth };
