const jwt = require('jsonwebtoken');
const store = require('../db/store');

const JWT_SECRET = process.env.JWT_SECRET || '9a2f8c4e7b1d3a5f6e8c9b0a2f4e6d8c1b3a5f7e9d0c2b4a6f8e0d2c4b6a8f1e';
const JWT_EXPIRES_IN = '24h';

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.username,
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      companyName: user.companyName
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  // Handle mock tokens from fallback auth if any
  if (token.startsWith('mock-jwt-')) {
    const mockUsername = token.replace('mock-jwt-', '');
    const user = store.findUserByUsername(mockUsername);
    if (user) {
      req.user = user;
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findUserByUsername(decoded.sub || decoded.username);
    if (user) {
      req.user = user;
    } else {
      req.user = {
        id: decoded.id,
        username: decoded.sub || decoded.username,
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.fullName,
        companyName: decoded.companyName
      };
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const userRole = req.user.role;
    if (allowedRoles.includes(userRole) || userRole === 'ROLE_ADMIN') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  requireRole
};
