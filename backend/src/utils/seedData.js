import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentpulse_ats';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Seed] Checking existing MongoDB collections...');

    // 1. Seed Demo Users if not present
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount === 0) {
      console.log('[Seed] Seeding demo users...');
      await User.create([
        {
          username: 'john_doe',
          email: 'john.doe@example.com',
          password: 'john123',
          role: 'ROLE_CANDIDATE',
          fullName: 'John Doe',
          age: '28',
          phone: '555-0199',
          emailVerified: true
        },
        {
          username: 'google',
          email: 'careers@google.com',
          password: 'google123',
          role: 'ROLE_COMPANY',
          fullName: 'Google Recruiter',
          companyName: 'Google',
          companyEmail: 'careers@google.com',
          phone: '555-0188',
          emailVerified: true
        },
        {
          username: 'admin',
          email: 'admin@talentpulse.io',
          password: 'admin123',
          role: 'ROLE_ADMIN',
          fullName: 'Platform Administrator',
          companyName: 'TalentPulse HQ',
          emailVerified: true
        },
        {
          username: 'alice_smith',
          email: 'alice.smith@example.com',
          password: 'password123',
          role: 'ROLE_CANDIDATE',
          fullName: 'Alice Smith',
          age: '26',
          phone: '555-0123',
          emailVerified: true
        },
        {
          username: 'bob_jones',
          email: 'bob.jones@example.com',
          password: 'password123',
          role: 'ROLE_CANDIDATE',
          fullName: 'Bob Jones',
          age: '29',
          phone: '555-0144',
          emailVerified: true
        }
      ]);
      console.log('[Seed] 5 Demo users successfully seeded.');
    }

    // 2. Seed Jobs if not present
    let jobs = await Job.find();
    if (jobs.length === 0) {
      console.log('[Seed] Seeding initial job requisitions...');
      jobs = await Job.create([
        {
          title: "Senior Java Backend Engineer",
          description: "We are seeking a Senior Java Engineer to build high-performance microservices. Minimum 5 years of experience with Spring Boot, PostgreSQL, Docker, and REST APIs required.",
          companyName: "Google",
          location: "Mountain View, CA (Hybrid)",
          employmentType: "Full-Time",
          requiredExperienceYears: 5,
          requiredSkills: "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git",
          salaryRange: "$160,000 - $190,000",
          active: true
        },
        {
          title: "Lead React Frontend Developer",
          description: "Join Google's core frontend UI team. Design responsive dashboard interfaces using React, TypeScript, Tailwind CSS, and state management frameworks.",
          companyName: "Google",
          location: "Remote",
          employmentType: "Full-Time",
          requiredExperienceYears: 4,
          requiredSkills: "React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API",
          salaryRange: "$140,000 - $175,000",
          active: true
        },
        {
          title: "Cloud DevOps & Platform Engineer",
          description: "Manage Kubernetes clusters, CI/CD pipelines, Terraform infrastructure, and AWS cloud environments for enterprise applications.",
          companyName: "Microsoft",
          location: "Redmond, WA (Hybrid)",
          employmentType: "Full-Time",
          requiredExperienceYears: 3,
          requiredSkills: "AWS, Docker, Kubernetes, CI/CD, Jenkins, Linux, Python, Git",
          salaryRange: "$145,000 - $175,000",
          active: true
        },
        {
          title: "Cloud Microservices Architect",
          description: "Architect distributed high-throughput event-driven microservices across AWS and hybrid clouds. Deep experience with Kafka, Docker, and Kubernetes required.",
          companyName: "Amazon",
          location: "Seattle, WA (Remote)",
          employmentType: "Full-Time",
          requiredExperienceYears: 6,
          requiredSkills: "Java, Go, Microservices, Kafka, AWS, Docker, Kubernetes, Distributed Systems",
          salaryRange: "$180,000 - $210,000",
          active: true
        },
        {
          title: "Senior Full Stack UI/UX Developer",
          description: "Build state-of-the-art enterprise workflow interfaces and candidate management tools with React 18, TypeScript, and modern CSS architectures.",
          companyName: "Salesforce",
          location: "San Francisco, CA",
          employmentType: "Full-Time",
          requiredExperienceYears: 4,
          requiredSkills: "React, TypeScript, Tailwind CSS, Node.js, GraphQL, REST API, Figma",
          salaryRange: "$150,000 - $180,000",
          active: true
        }
      ]);
      console.log(`[Seed] ${jobs.length} Job requisitions seeded.`);
    }

    // 3. Seed Applications if not present
    const appsCount = await Application.countDocuments();
    if (appsCount === 0 && jobs.length > 0) {
      console.log('[Seed] Seeding initial candidate applications...');
      await Application.create([
        {
          jobId: jobs[0]._id,
          job: {
            id: jobs[0]._id.toString(),
            title: jobs[0].title,
            companyName: jobs[0].companyName,
            location: jobs[0].location,
            employmentType: jobs[0].employmentType,
            requiredSkills: jobs[0].requiredSkills,
            salaryRange: jobs[0].salaryRange
          },
          candidate: {
            id: '1',
            username: "john_doe",
            fullName: "John Doe",
            email: "john.doe@example.com",
            role: "ROLE_CANDIDATE"
          },
          status: "INTERVIEWING",
          matchScore: 92,
          estimatedExperienceYears: 6,
          extractedEducation: "Bachelor of Technology in Computer Science",
          extractedSkills: "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git, SQL",
          missingSkills: "",
          resumeFileName: "John_Doe_Senior_Java_Resume.pdf",
          resumeText: "John Doe. 6+ years experienced Senior Java Developer proficient in Spring Boot, Microservices, PostgreSQL, Docker, REST API, Git."
        },
        {
          jobId: jobs[1]._id,
          job: {
            id: jobs[1]._id.toString(),
            title: jobs[1].title,
            companyName: jobs[1].companyName,
            location: jobs[1].location,
            employmentType: jobs[1].employmentType,
            requiredSkills: jobs[1].requiredSkills,
            salaryRange: jobs[1].salaryRange
          },
          candidate: {
            id: '2',
            username: "alice_smith",
            fullName: "Alice Smith",
            email: "alice.smith@example.com",
            role: "ROLE_CANDIDATE"
          },
          status: "OFFERED",
          matchScore: 95,
          estimatedExperienceYears: 5,
          extractedEducation: "Bachelor of Science in Information Technology",
          extractedSkills: "React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API",
          missingSkills: "",
          resumeFileName: "Alice_Smith_Lead_React_Resume.pdf",
          resumeText: "Alice Smith. Lead Frontend Engineer with 5 years experience building complex React and TypeScript UIs."
        },
        {
          jobId: jobs[0]._id,
          job: {
            id: jobs[0]._id.toString(),
            title: jobs[0].title,
            companyName: jobs[0].companyName,
            location: jobs[0].location,
            employmentType: jobs[0].employmentType,
            requiredSkills: jobs[0].requiredSkills,
            salaryRange: jobs[0].salaryRange
          },
          candidate: {
            id: '3',
            username: "bob_jones",
            fullName: "Bob Jones",
            email: "bob.jones@example.com",
            role: "ROLE_CANDIDATE"
          },
          status: "UNDER_REVIEW",
          matchScore: 78,
          estimatedExperienceYears: 3,
          extractedEducation: "Bachelor of Engineering",
          extractedSkills: "Java, Spring Boot, REST API, Git, SQL",
          missingSkills: "Microservices, PostgreSQL, Docker",
          resumeFileName: "Bob_Jones_Resume.pdf",
          resumeText: "Bob Jones. Java Developer with 3 years of software engineering experience."
        }
      ]);
      console.log('[Seed] 3 Candidate applications seeded.');
    }

    // 4. Seed Interviews if not present
    const interviewsCount = await Interview.countDocuments();
    if (interviewsCount === 0) {
      console.log('[Seed] Seeding initial interviews...');
      await Interview.create([
        {
          candidateName: 'John Doe',
          jobTitle: 'Senior Java Backend Engineer',
          companyName: 'Google',
          date: '2026-09-18',
          time: '10:30 AM PST',
          type: 'Technical Screening',
          meetingUrl: 'https://meet.google.com/tp-interview-room',
          interviewer: 'Sarah Jenkins (Senior Technical Recruiter)',
          notes: 'Prepare system design and concurrency questions.',
          status: 'SCHEDULED'
        }
      ]);
      console.log('[Seed] 1 Scheduled interview seeded.');
    }

    console.log('[Seed] MongoDB initialization & seeding completed.');
  } catch (error) {
    console.error('[Seed] Seeding error:', error);
  }
};

// If run directly: node src/utils/seedData.js
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}
