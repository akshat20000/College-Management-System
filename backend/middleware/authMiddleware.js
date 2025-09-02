const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

// Middleware: Protect Routes (Authentication)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or token malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware: Authorize Specific Roles
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Access denied: Not authenticated' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied: Role '${req.user.role}' not allowed` });
  }

  next();
};

module.exports = {
  protect,
  authorizeRoles,
};
