import prisma from './db.js';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    const userCount = await prisma.users.count();
    if (userCount > 0) {
      console.log('Database already has users, skipping seeder.');
      return;
    }

    console.log('Seeding database with default records...');

    // 1. Seed Admin
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    await prisma.users.create({
      data: {
        username: 'admin',
        password: adminPasswordHash,
        email: 'admin@ats.com',
        role: 'ROLE_ADMIN',
      },
    });

    // 2. Seed Company User & Company Profile
    const companyPasswordHash = bcrypt.hashSync('google123', 10);
    const companyUser = await prisma.users.create({
      data: {
        username: 'google',
        password: companyPasswordHash,
        email: 'jobs@google.com',
        role: 'ROLE_COMPANY',
      },
    });

    await prisma.companies.create({
      data: {
        user_id: companyUser.id,
        name: 'Google LLC',
        description: 'Search engine and AI pioneer',
        industry: 'Technology',
        location: 'Mountain View, CA',
        website: 'https://google.com',
      },
    });

    // 3. Seed Candidate User & Candidate Profile
    const candidatePasswordHash = bcrypt.hashSync('john123', 10);
    const candidateUser = await prisma.users.create({
      data: {
        username: 'john_doe',
        password: candidatePasswordHash,
        email: 'john.doe@gmail.com',
        role: 'ROLE_CANDIDATE',
      },
    });

    const candidate = await prisma.candidates.create({
      data: {
        user_id: candidateUser.id,
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1-555-0199',
        title: 'Full Stack Developer',
      },
    });

    // Seed candidate skills
    const skills = ['Java', 'Spring Boot', 'React', 'SQL', 'Git'];
    for (const skill of skills) {
      await prisma.candidate_skills.create({
        data: {
          candidate_id: candidate.id,
          skill: skill,
        },
      });
    }

    // Seed candidate education
    const educations = ['Bachelor of Science in Computer Science - Stanford University'];
    for (const edu of educations) {
      await prisma.candidate_education.create({
        data: {
          candidate_id: candidate.id,
          education_entry: edu,
        },
      });
    }

    // Seed candidate experience
    const experiences = ['Software Engineer Intern - Google', 'Junior Developer - Acme Corp'];
    for (const exp of experiences) {
      await prisma.candidate_experience.create({
        data: {
          candidate_id: candidate.id,
          experience_entry: exp,
        },
      });
    }

    console.log('Dummy Database Seeded Successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] && process.argv[1].endsWith('dbSeeder.js')) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
