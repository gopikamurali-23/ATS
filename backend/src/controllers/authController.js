import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const {
      username,
      password,
      email,
      role,
      firstName,
      lastName,
      phone,
      companyName,
      description,
      industry,
      location,
      website
    } = req.body;

    // Validation checks
    if (!username || !password || !email || !role) {
      return res.status(400).body ? res.status(400).body('Error: Missing required registration fields!') : res.status(400).send('Error: Missing required registration fields!');
    }

    // Checking if username exists
    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });
    if (existingUsername) {
      // Spring Boot returns BAD_REQUEST with text message in body
      return res.status(400).send('Error: Username is already taken!');
    }

    // Checking if email exists
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).send('Error: Email is already in use!');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user and associated profile transactionally
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          username,
          password: hashedPassword,
          email,
          role,
        },
      });

      let profileId = null;

      if (role === 'ROLE_COMPANY') {
        const company = await tx.companies.create({
          data: {
            user_id: newUser.id,
            name: companyName || '',
            description: description || '',
            industry: industry || '',
            location: location || '',
            website: website || '',
          },
        });
        profileId = company.id;
      } else if (role === 'ROLE_CANDIDATE') {
        const candidate = await tx.candidates.create({
          data: {
            user_id: newUser.id,
            first_name: firstName || '',
            last_name: lastName || '',
            phone: phone || '',
            title: 'Job Seeker',
          },
        });
        profileId = candidate.id;
      }

      return { user: newUser, profileId };
    });

    const token = generateToken(result.user.username);

    // Return JwtResponse
    return res.status(200).json({
      token,
      type: 'Bearer',
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
      profileId: result.profileId,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send('Error: Username and password are required!');
    }

    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      // Return 401 Unauthorized for invalid credentials, matching Spring Security error
      return res.status(401).send('Error: Invalid username or password!');
    }

    let profileId = null;

    if (user.role === 'ROLE_COMPANY') {
      const company = await prisma.companies.findUnique({
        where: { user_id: user.id },
      });
      profileId = company ? company.id : null;
    } else if (user.role === 'ROLE_CANDIDATE') {
      const candidate = await prisma.candidates.findUnique({
        where: { user_id: user.id },
      });
      profileId = candidate ? candidate.id : null;
    }

    const token = generateToken(user.username);

    return res.status(200).json({
      token,
      type: 'Bearer',
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileId: profileId,
    });
  } catch (error) {
    next(error);
  }
};
