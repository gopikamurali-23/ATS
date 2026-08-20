import prisma from '../config/db.js';
import { getUsernameFromJwt } from '../utils/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Error: Unauthorized! Token is missing.' });
    }

    const token = authHeader.substring(7);
    const username = getUsernameFromJwt(token);

    if (!username) {
      return res.status(401).json({ message: 'Error: Unauthorized! Invalid token.' });
    }

    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: 'Error: User not found with token credentials.' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Error: Unauthorized!' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Error: Forbidden! Access is denied.' });
    }

    next();
  };
};
