import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'talentpulse_super_secret_jwt_key_2026_ats_platform',
    { expiresIn: '30d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { email, username, password, role, fullName, age, phone, companyName, companyEmail } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: (email || '').toLowerCase() }, { username: (username || '').toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const newUser = await User.create({
      username: username || email.split('@')[0],
      email: email.toLowerCase(),
      password: password || 'password123',
      role: role || 'ROLE_CANDIDATE',
      fullName: fullName || 'User',
      age: age || '',
      phone: phone || '',
      companyName: companyName || null,
      companyEmail: companyEmail || null,
      emailVerified: true
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      id: newUser._id,
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      age: newUser.age,
      phone: newUser.phone,
      companyName: newUser.companyName,
      companyEmail: newUser.companyEmail,
      emailVerified: newUser.emailVerified,
      otpCodeDemo: '123456'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password, expectedRole } = req.body;
    const idLower = (loginIdentifier || '').trim().toLowerCase();

    // Find by email or username
    const user = await User.findOne({
      $or: [{ email: idLower }, { username: idLower }]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email/username or password. Try Candidate (john.doe@example.com / john123) or Recruiter (careers@google.com / google123).'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Please verify your password.' });
    }

    if (expectedRole && user.role !== expectedRole && user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        message: `This account is registered as a ${user.role === 'ROLE_COMPANY' ? 'Recruiter' : 'Candidate'}. Please sign in via the correct portal tab.`
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      id: user._id,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      age: user.age,
      phone: user.phone,
      companyName: user.companyName,
      companyEmail: user.companyEmail,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  res.json({
    message: `Verification OTP sent to ${email}`,
    otpCodeDemo: '123456'
  });
};

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  if (otp === '123456' || (typeof otp === 'string' && otp.trim().length === 6)) {
    return res.json({ success: true, message: 'OTP verified successfully!', verified: true });
  }
  return res.status(400).json({ message: 'Invalid OTP code. Please enter 123456 for demo mode.' });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.json({
    message: `Password reset verification code dispatched to ${email}`,
    otpCodeDemo: '123456'
  });
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (otp !== '123456' && !(typeof otp === 'string' && otp.trim().length === 6)) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (user) {
      user.password = newPassword;
      await user.save();
    }

    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
