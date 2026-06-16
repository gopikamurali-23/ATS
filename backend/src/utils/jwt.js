import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRATION_MS = parseInt(process.env.JWT_EXPIRATION_MS || '86400000', 10);

export const generateToken = (username) => {
  // Convert expiration ms to seconds for jsonwebtoken library format or string like '24h'
  const expiresInSeconds = Math.floor(JWT_EXPIRATION_MS / 1000);
  return jwt.sign(
    { sub: username },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: expiresInSeconds,
    }
  );
};

export const getUsernameFromJwt = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub;
  } catch (error) {
    return null;
  }
};

export const validateToken = (token) => {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};
