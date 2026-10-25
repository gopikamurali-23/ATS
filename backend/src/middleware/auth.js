import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Support demo sessions gracefully
    if (token === 'mock-jwt-john-session') {
      const user = await User.findOne({ email: 'john.doe@example.com' });
      req.user = user || { id: 1, role: 'ROLE_CANDIDATE', fullName: 'John Doe', email: 'john.doe@example.com' };
      return next();
    }
    if (token === 'mock-jwt-google-session') {
      const user = await User.findOne({ email: 'careers@google.com' });
      req.user = user || { id: 4, role: 'ROLE_COMPANY', fullName: 'Google Recruiter', email: 'careers@google.com', companyName: 'Google' };
      return next();
    }
    if (token === 'mock-jwt-admin-session') {
      const user = await User.findOne({ email: 'admin@talentpulse.io' });
      req.user = user || { id: 6, role: 'ROLE_ADMIN', fullName: 'Platform Administrator', email: 'admin@talentpulse.io' };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'talentpulse_super_secret_jwt_key_2026_ats_platform');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User belonging to token no longer exists' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'ROLE_ADMIN')) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
};
