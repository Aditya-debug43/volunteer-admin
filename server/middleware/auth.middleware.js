const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User');

// Verifies JWT access token from the Authorization: Bearer header
const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ message: 'Account not available' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role gate factory
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

const requireAdmin = requireRole('admin', 'super_admin', 'city_coordinator');
const requireSuperAdmin = requireRole('super_admin');

module.exports = { verifyToken, requireRole, requireAdmin, requireSuperAdmin };
