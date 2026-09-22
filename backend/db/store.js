const bcrypt = require('bcryptjs');

let users = [
  {
    id: 1,
    username: 'john_doe',
    passwordHash: bcrypt.hashSync('john123', 8),
    email: 'john.doe@example.com',
    role: 'ROLE_CANDIDATE',
    fullName: 'John Doe',
    companyName: null
  },
  {
    id: 2,
    username: 'alice_smith',
    passwordHash: bcrypt.hashSync('alice123', 8),
    email: 'alice.smith@example.com',
    role: 'ROLE_CANDIDATE',
    fullName: 'Alice Smith',
    companyName: null
  },
  {
    id: 3,
    username: 'bob_jones',
    passwordHash: bcrypt.hashSync('bob123', 8),
    email: 'bob.jones@example.com',
    role: 'ROLE_CANDIDATE',
    fullName: 'Bob Jones',
    companyName: null
  },
  {
    id: 4,
    username: 'google',
    passwordHash: bcrypt.hashSync('google123', 8),
    email: 'careers@google.com',
    role: 'ROLE_COMPANY',
    fullName: 'Google Recruiter',
    companyName: 'Google'
  },
  {
    id: 5,
    username: 'microsoft',
    passwordHash: bcrypt.hashSync('microsoft123', 8),
    email: 'careers@microsoft.com',
    role: 'ROLE_COMPANY',
    fullName: 'Microsoft HR',
    companyName: 'Microsoft'
  },
  {
    id: 6,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 8),
    email: 'admin@talentpulse.io',
    role: 'ROLE_ADMIN',
    fullName: 'Platform Administrator',
    companyName: 'TalentPulse HQ'
  }
];

let jobs = [
  {
    id: 1,
    title: 'Senior Java Backend Engineer',
    description: 'We are seeking a Senior Java Engineer to build high-performance microservices. Minimum 5 years of experience with Spring Boot, PostgreSQL, Docker, and REST APIs required.',
    companyName: 'Google',
    location: 'Mountain View, CA (Hybrid)',
    employmentType: 'Full-Time',
    requiredExperienceYears: 5,
    requiredSkills: 'Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git',
    salaryRange: '$140,000 - $180,000',
    active: true,
    createdAt: new Date('2026-09-01T10:00:00.000Z').toISOString()
  },
  {
    id: 2,
    title: 'Lead React Frontend Developer',
    description: "Join Google's core frontend UI team. Design responsive dashboard interfaces using React, TypeScript, Tailwind CSS, and state management frameworks.",
    companyName: 'Google',
    location: 'Remote',
    employmentType: 'Full-Time',
    requiredExperienceYears: 4,
    requiredSkills: 'React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API',
    salaryRange: '$130,000 - $165,000',
    active: true,
    createdAt: new Date('2026-09-02T11:30:00.000Z').toISOString()
  },
  {
    id: 3,
    title: 'Cloud DevOps & Platform Engineer',
    description: 'Manage Kubernetes clusters, CI/CD pipelines, Terraform infrastructure, and AWS cloud environments for enterprise applications.',
    companyName: 'Microsoft',
    location: 'Redmond, WA',
    employmentType: 'Full-Time',
    requiredExperienceYears: 3,
    requiredSkills: 'AWS, Docker, Kubernetes, CI/CD, Jenkins, Linux, Python, Git',
    salaryRange: '$125,000 - $155,000',
    active: true,
    createdAt: new Date('2026-09-03T14:15:00.000Z').toISOString()
  },
  {
    id: 4,
    title: 'Full Stack Engineer (Java + React)',
    description: 'Build end-to-end features using Java Spring Boot on the backend and React on the frontend.',
    companyName: 'Google',
    location: 'New York, NY',
    employmentType: 'Full-Time',
    requiredExperienceYears: 3,
    requiredSkills: 'Java, Spring Boot, React, JavaScript, SQL, PostgreSQL, REST API',
    salaryRange: '$120,000 - $150,000',
    active: true,
    createdAt: new Date('2026-09-04T09:00:00.000Z').toISOString()
  }
];

let applications = [
  {
    id: 1,
    jobId: 1,
    job: jobs[0],
    candidateId: 1,
    candidate: { id: 1, username: 'john_doe', email: 'john.doe@example.com', role: 'ROLE_CANDIDATE', fullName: 'John Doe', companyName: null },
    status: 'INTERVIEWING',
    matchScore: 92,
    estimatedExperienceYears: 6,
    extractedEducation: 'Bachelor of Technology in Computer Science',
    extractedSkills: 'Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git, SQL',
    missingSkills: '',
    resumeFileName: 'John_Doe_Senior_Java_Resume.pdf',
    resumeText: 'John Doe. 6+ years experienced Senior Java Developer proficient in Spring Boot, Microservices, PostgreSQL, Docker, REST API, Git.',
    appliedAt: new Date('2026-09-02T15:30:00.000Z').toISOString()
  },
  {
    id: 2,
    jobId: 2,
    job: jobs[1],
    candidateId: 2,
    candidate: { id: 2, username: 'alice_smith', email: 'alice.smith@example.com', role: 'ROLE_CANDIDATE', fullName: 'Alice Smith', companyName: null },
    status: 'OFFERED',
    matchScore: 95,
    estimatedExperienceYears: 5,
    extractedEducation: 'Bachelor of Science in Information Technology',
    extractedSkills: 'React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API',
    missingSkills: '',
    resumeFileName: 'Alice_Smith_Lead_React_Resume.pdf',
    resumeText: 'Alice Smith. Lead Frontend Engineer with 5 years experience building complex React and TypeScript UIs.',
    appliedAt: new Date('2026-09-03T09:20:00.000Z').toISOString()
  },
  {
    id: 3,
    jobId: 1,
    job: jobs[0],
    candidateId: 3,
    candidate: { id: 3, username: 'bob_jones', email: 'bob.jones@example.com', role: 'ROLE_CANDIDATE', fullName: 'Bob Jones', companyName: null },
    status: 'UNDER_REVIEW',
    matchScore: 78,
    estimatedExperienceYears: 3,
    extractedEducation: 'Bachelor of Engineering',
    extractedSkills: 'Java, Spring Boot, REST API, Git, SQL',
    missingSkills: 'Microservices, PostgreSQL, Docker',
    resumeFileName: 'Bob_Jones_Resume.pdf',
    resumeText: 'Bob Jones. Java Developer with 3 years of software engineering experience.',
    appliedAt: new Date('2026-09-03T16:45:00.000Z').toISOString()
  },
  {
    id: 4,
    jobId: 3,
    job: jobs[2],
    candidateId: 1,
    candidate: { id: 1, username: 'john_doe', email: 'john.doe@example.com', role: 'ROLE_CANDIDATE', fullName: 'John Doe', companyName: null },
    status: 'APPLIED',
    matchScore: 85,
    estimatedExperienceYears: 6,
    extractedEducation: 'Bachelor of Technology in Computer Science',
    extractedSkills: 'Docker, AWS, Linux, Python, Git, CI/CD',
    missingSkills: 'Kubernetes, Jenkins',
    resumeFileName: 'John_Doe_DevOps_Resume.pdf',
    resumeText: 'John Doe. Experienced with Docker, AWS, Linux, Python and CI/CD pipelines.',
    appliedAt: new Date('2026-09-04T10:15:00.000Z').toISOString()
  }
];

let nextUserId = 7;
let nextJobId = 5;
let nextAppId = 5;

// User methods
const findUserByUsername = (username) => users.find(u => u.username.toLowerCase() === username.toLowerCase());
const findUserByEmail = (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase());
const findUserById = (id) => users.find(u => u.id === Number(id));

const createUser = ({ username, password, email, role, fullName, age, phone, companyName, companyEmail, emailVerified }) => {
  const newUser = {
    id: nextUserId++,
    username,
    passwordHash: bcrypt.hashSync(password, 8),
    email,
    role: role || 'ROLE_CANDIDATE',
    fullName,
    age: age || null,
    phone: phone || null,
    companyName: companyName || null,
    companyEmail: companyEmail || null,
    emailVerified: emailVerified !== undefined ? emailVerified : false
  };
  users.push(newUser);
  return newUser;
};

// Job methods
const getActiveJobs = () => jobs.filter(j => j.active !== false).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const getJobById = (id) => jobs.find(j => j.id === Number(id));
const getJobsByCompany = (companyName) => jobs.filter(j => j.companyName && j.companyName.toLowerCase() === companyName.toLowerCase()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const createJob = (jobData) => {
  const newJob = {
    id: nextJobId++,
    title: jobData.title,
    description: jobData.description,
    companyName: jobData.companyName || 'Google',
    location: jobData.location || 'Remote',
    employmentType: jobData.employmentType || 'Full-Time',
    requiredExperienceYears: Number(jobData.requiredExperienceYears) || 0,
    requiredSkills: jobData.requiredSkills || '',
    salaryRange: jobData.salaryRange || '',
    active: jobData.active !== undefined ? jobData.active : true,
    createdAt: new Date().toISOString()
  };
  jobs.unshift(newJob);
  return newJob;
};

const updateJob = (id, updatedData) => {
  const job = getJobById(id);
  if (!job) return null;
  if (updatedData.title !== undefined) job.title = updatedData.title;
  if (updatedData.description !== undefined) job.description = updatedData.description;
  if (updatedData.location !== undefined) job.location = updatedData.location;
  if (updatedData.employmentType !== undefined) job.employmentType = updatedData.employmentType;
  if (updatedData.requiredExperienceYears !== undefined) job.requiredExperienceYears = Number(updatedData.requiredExperienceYears);
  if (updatedData.requiredSkills !== undefined) job.requiredSkills = updatedData.requiredSkills;
  if (updatedData.salaryRange !== undefined) job.salaryRange = updatedData.salaryRange;
  if (updatedData.active !== undefined) job.active = updatedData.active;
  return job;
};

const deleteJob = (id) => {
  jobs = jobs.filter(j => j.id !== Number(id));
};

// Application methods
const createApplication = (appData) => {
  const newApp = {
    id: nextAppId++,
    jobId: Number(appData.jobId),
    job: appData.job,
    candidateId: appData.candidate.id,
    candidate: {
      id: appData.candidate.id,
      username: appData.candidate.username,
      email: appData.candidate.email,
      role: appData.candidate.role,
      fullName: appData.candidate.fullName,
      companyName: appData.candidate.companyName
    },
    status: appData.status || 'APPLIED',
    matchScore: appData.matchScore || 0,
    estimatedExperienceYears: appData.estimatedExperienceYears || 0,
    extractedEducation: appData.extractedEducation || '',
    extractedSkills: appData.extractedSkills || '',
    missingSkills: appData.missingSkills || '',
    resumeFileName: appData.resumeFileName || 'pasted_resume.txt',
    resumeText: appData.resumeText || '',
    appliedAt: new Date().toISOString()
  };
  applications.unshift(newApp);
  return newApp;
};

const getCandidateApplications = (candidateId) => {
  return applications
    .filter(a => a.candidateId === Number(candidateId))
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
};

const getRankedApplicationsForJob = (jobId) => {
  return applications
    .filter(a => a.jobId === Number(jobId))
    .sort((a, b) => b.matchScore - a.matchScore);
};

const getCompanyApplications = (companyName) => {
  return applications
    .filter(a => a.job && a.job.companyName && a.job.companyName.toLowerCase() === companyName.toLowerCase())
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
};

const updateApplicationStatus = (id, status) => {
  const app = applications.find(a => a.id === Number(id));
  if (!app) return null;
  app.status = status;
  return app;
};

// Dashboard analytics calculation
const getDashboardStats = () => {
  const totalJobsCount = jobs.length;
  const totalAppsCount = applications.length;
  const totalCandidatesCount = users.filter(u => u.role === 'ROLE_CANDIDATE').length;

  let avgScore = 0;
  if (totalAppsCount > 0) {
    const sum = applications.reduce((acc, a) => acc + (a.matchScore || 0), 0);
    avgScore = Math.round((sum / totalAppsCount) * 10) / 10;
  }

  const applicationsByStatus = {
    APPLIED: applications.filter(a => a.status === 'APPLIED').length,
    UNDER_REVIEW: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    INTERVIEWING: applications.filter(a => a.status === 'INTERVIEWING').length,
    OFFERED: applications.filter(a => a.status === 'OFFERED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length
  };

  const skillCounts = {};
  applications.forEach(app => {
    if (app.extractedSkills) {
      app.extractedSkills.split(',').forEach(s => {
        const skill = s.trim();
        if (skill) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      });
    }
  });

  const sortedTopSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});

  const monthlyFunnel = {
    "Total Applications": totalAppsCount,
    "Under Review": applicationsByStatus.UNDER_REVIEW,
    "Interviewing": applicationsByStatus.INTERVIEWING,
    "Offered": applicationsByStatus.OFFERED
  };

  return {
    totalJobs: totalJobsCount,
    totalApplications: totalAppsCount,
    totalCandidates: totalCandidatesCount,
    avgMatchScore: avgScore,
    applicationsByStatus,
    topSkills: sortedTopSkills,
    monthlyFunnel
  };
};

module.exports = {
  users,
  jobs,
  applications,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
  getActiveJobs,
  getJobById,
  getJobsByCompany,
  createJob,
  updateJob,
  deleteJob,
  createApplication,
  getCandidateApplications,
  getRankedApplicationsForJob,
  getCompanyApplications,
  updateApplicationStatus,
  getDashboardStats
};
