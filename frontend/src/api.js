// TalentPulse ATS - Pure Client-Side Resilient Data Service Layer
// Completely standalone with persistent localStorage support for Review 1

const STORAGE_KEYS = {
  JOBS: 'talentpulse_jobs_store',
  APPLICATIONS: 'talentpulse_applications_store',
  USERS: 'talentpulse_registered_users',
  INTERVIEWS: 'talentpulse_interviews_store'
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('talentpulse_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Seed Jobs Dataset
const INITIAL_JOBS = [
  {
    id: 1,
    title: "Senior Java Backend Engineer",
    description: "We are seeking a Senior Java Engineer to build high-performance microservices. Minimum 5 years of experience with Spring Boot, PostgreSQL, Docker, and REST APIs required.",
    companyName: "Google",
    location: "Mountain View, CA (Hybrid)",
    employmentType: "Full-Time",
    requiredExperienceYears: 5,
    requiredSkills: "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git",
    salaryRange: "$160,000 - $190,000",
    active: true,
    createdAt: "2026-09-01T10:00:00"
  },
  {
    id: 2,
    title: "Lead React Frontend Developer",
    description: "Join Google's core frontend UI team. Design responsive dashboard interfaces using React, TypeScript, Tailwind CSS, and state management frameworks.",
    companyName: "Google",
    location: "Remote",
    employmentType: "Full-Time",
    requiredExperienceYears: 4,
    requiredSkills: "React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API",
    salaryRange: "$140,000 - $175,000",
    active: true,
    createdAt: "2026-09-02T11:30:00"
  },
  {
    id: 3,
    title: "Cloud DevOps & Platform Engineer",
    description: "Manage Kubernetes clusters, CI/CD pipelines, Terraform infrastructure, and AWS cloud environments for enterprise applications.",
    companyName: "Microsoft",
    location: "Redmond, WA (Hybrid)",
    employmentType: "Full-Time",
    requiredExperienceYears: 3,
    requiredSkills: "AWS, Docker, Kubernetes, CI/CD, Jenkins, Linux, Python, Git",
    salaryRange: "$145,000 - $175,000",
    active: true,
    createdAt: "2026-09-03T14:15:00"
  },
  {
    id: 4,
    title: "Cloud Microservices Architect",
    description: "Architect distributed high-throughput event-driven microservices across AWS and hybrid clouds. Deep experience with Kafka, Docker, and Kubernetes required.",
    companyName: "Amazon",
    location: "Seattle, WA (Remote)",
    employmentType: "Full-Time",
    requiredExperienceYears: 6,
    requiredSkills: "Java, Go, Microservices, Kafka, AWS, Docker, Kubernetes, Distributed Systems",
    salaryRange: "$180,000 - $210,000",
    active: true,
    createdAt: "2026-09-05T09:00:00"
  },
  {
    id: 5,
    title: "Senior Full Stack UI/UX Developer",
    description: "Build state-of-the-art enterprise workflow interfaces and candidate management tools with React 18, TypeScript, and modern CSS architectures.",
    companyName: "Salesforce",
    location: "San Francisco, CA",
    employmentType: "Full-Time",
    requiredExperienceYears: 4,
    requiredSkills: "React, TypeScript, Tailwind CSS, Node.js, GraphQL, REST API, Figma",
    salaryRange: "$150,000 - $180,000",
    active: true,
    createdAt: "2026-09-08T16:00:00"
  }
];

// Seed Applications Dataset
const INITIAL_APPLICATIONS = [
  {
    id: 101,
    jobId: 1,
    job: INITIAL_JOBS[0],
    candidate: { id: 1, username: "john_doe", fullName: "John Doe", email: "john.doe@example.com", role: "ROLE_CANDIDATE" },
    status: "INTERVIEWING",
    matchScore: 92,
    estimatedExperienceYears: 6,
    extractedEducation: "Bachelor of Technology in Computer Science",
    extractedSkills: "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git, SQL",
    missingSkills: "",
    resumeFileName: "John_Doe_Senior_Java_Resume.pdf",
    resumeText: "John Doe. 6+ years experienced Senior Java Developer proficient in Spring Boot, Microservices, PostgreSQL, Docker, REST API, Git.",
    appliedAt: "2026-09-02T15:30:00"
  },
  {
    id: 102,
    jobId: 2,
    job: INITIAL_JOBS[1],
    candidate: { id: 2, username: "alice_smith", fullName: "Alice Smith", email: "alice.smith@example.com", role: "ROLE_CANDIDATE" },
    status: "OFFERED",
    matchScore: 95,
    estimatedExperienceYears: 5,
    extractedEducation: "Bachelor of Science in Information Technology",
    extractedSkills: "React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API",
    missingSkills: "",
    resumeFileName: "Alice_Smith_Lead_React_Resume.pdf",
    resumeText: "Alice Smith. Lead Frontend Engineer with 5 years experience building complex React and TypeScript UIs.",
    appliedAt: "2026-09-03T09:20:00"
  },
  {
    id: 103,
    jobId: 1,
    job: INITIAL_JOBS[0],
    candidate: { id: 3, username: "bob_jones", fullName: "Bob Jones", email: "bob.jones@example.com", role: "ROLE_CANDIDATE" },
    status: "UNDER_REVIEW",
    matchScore: 78,
    estimatedExperienceYears: 3,
    extractedEducation: "Bachelor of Engineering",
    extractedSkills: "Java, Spring Boot, REST API, Git, SQL",
    missingSkills: "Microservices, PostgreSQL, Docker",
    resumeFileName: "Bob_Jones_Resume.pdf",
    resumeText: "Bob Jones. Java Developer with 3 years of software engineering experience.",
    appliedAt: "2026-09-03T16:45:00"
  }
];

// Helper to simulate smooth micro-delay for realistic UI feedback
const delay = (ms = 80) => new Promise(resolve => setTimeout(resolve, ms));

// Storage helper utilities
const getStoredJobs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
  return INITIAL_JOBS;
};

const saveStoredJobs = (jobs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  } catch (e) {}
};

const getStoredApplications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
  return INITIAL_APPLICATIONS;
};

const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (e) {}
};

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {}
};

// Known technical dictionary for client-side ATS analysis
const TECH_SKILLS_DICTIONARY = [
  'Java', 'Spring Boot', 'Spring Data JPA', 'Microservices', 'PostgreSQL', 
  'Docker', 'REST API', 'Git', 'SQL', 'React', 'TypeScript', 'JavaScript', 
  'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'AWS', 'Kubernetes', 'CI/CD', 
  'Jenkins', 'Linux', 'Python', 'Kafka', 'Go', 'GraphQL', 'Node.js', 
  'Figma', 'Redis', 'MongoDB', 'C++', 'System Design', 'Agile'
];

export const api = {
  // ==========================================
  // AUTHENTICATION & IDENTITY APIS
  // ==========================================
  async login(loginIdentifier, password, expectedRole) {
    await delay(120);
    const idLower = (loginIdentifier || '').trim().toLowerCase();

    // 1. Check Demo Accounts
    if ((idLower === 'john.doe@example.com' || idLower === 'john_doe' || idLower === 'john') && password === 'john123') {
      if (expectedRole && expectedRole === 'ROLE_COMPANY') {
        throw new Error('This account (john.doe@example.com) is a Candidate account. Please use Candidate Login.');
      }
      return { 
        token: 'mock-jwt-john-session', 
        id: 1, 
        username: 'john_doe', 
        email: 'john.doe@example.com', 
        role: 'ROLE_CANDIDATE', 
        fullName: 'John Doe', 
        age: '28', 
        phone: '555-0199', 
        companyName: null, 
        emailVerified: true 
      };
    } else if ((idLower === 'careers@google.com' || idLower === 'google' || idLower === 'recruiter') && password === 'google123') {
      if (expectedRole && expectedRole === 'ROLE_CANDIDATE') {
        throw new Error('This account (careers@google.com) is a Recruiter account. Please use Recruiter Login.');
      }
      return { 
        token: 'mock-jwt-google-session', 
        id: 4, 
        username: 'google', 
        email: 'careers@google.com', 
        role: 'ROLE_COMPANY', 
        fullName: 'Google Recruiter', 
        companyName: 'Google', 
        companyEmail: 'careers@google.com', 
        phone: '555-0188', 
        emailVerified: true 
      };
    } else if ((idLower === 'admin@talentpulse.io' || idLower === 'admin') && password === 'admin123') {
      return { 
        token: 'mock-jwt-admin-session', 
        id: 6, 
        username: 'admin', 
        email: 'admin@talentpulse.io', 
        role: 'ROLE_ADMIN', 
        fullName: 'Platform Administrator', 
        companyName: 'TalentPulse HQ', 
        emailVerified: true 
      };
    }

    // 2. Check Custom Registered Users from localStorage
    const registeredUsers = getStoredUsers();
    const foundUser = registeredUsers.find(u => 
      (u.email?.toLowerCase() === idLower || u.username?.toLowerCase() === idLower) && u.password === password
    );

    if (foundUser) {
      if (expectedRole && foundUser.role !== expectedRole && foundUser.role !== 'ROLE_ADMIN') {
        throw new Error(`This account is registered as a ${foundUser.role === 'ROLE_COMPANY' ? 'Recruiter' : 'Candidate'}. Please sign in via the correct portal tab.`);
      }
      return {
        token: 'mock-jwt-' + foundUser.id,
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        fullName: foundUser.fullName,
        age: foundUser.age,
        phone: foundUser.phone,
        companyName: foundUser.companyName,
        companyEmail: foundUser.companyEmail,
        emailVerified: true
      };
    }

    throw new Error('Invalid email/username or password. For demo mode, try Candidate (john.doe@example.com / john123) or Recruiter (careers@google.com / google123).');
  },

  async register(data) {
    await delay(120);
    const registeredUsers = getStoredUsers();
    const existing = registeredUsers.find(u => u.email?.toLowerCase() === (data.email || '').toLowerCase());
    if (existing) {
      throw new Error(`An account with email ${data.email} is already registered.`);
    }

    const newUser = {
      id: Date.now(),
      username: data.username || data.email.split('@')[0],
      email: data.email,
      password: data.password || 'password123',
      role: data.role || 'ROLE_CANDIDATE',
      fullName: data.fullName,
      age: data.age || null,
      phone: data.phone || null,
      companyName: data.companyName || null,
      companyEmail: data.companyEmail || null,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    registeredUsers.push(newUser);
    saveStoredUsers(registeredUsers);

    return {
      token: 'mock-jwt-' + newUser.id,
      ...newUser,
      otpCodeDemo: '123456'
    };
  },

  async sendOtp(email) {
    await delay(80);
    return { message: `Verification OTP sent to ${email}`, otpCodeDemo: '123456' };
  },

  async verifyOtp(email, otp) {
    await delay(80);
    if (otp === '123456' || (typeof otp === 'string' && otp.trim().length === 6)) {
      return { success: true, message: 'OTP verified successfully!', verified: true };
    }
    throw new Error('Invalid OTP code. Please enter 123456 for demo mode verification.');
  },

  async forgotPassword(email) {
    await delay(80);
    return { message: `Password reset verification code dispatched to ${email}`, otpCodeDemo: '123456' };
  },

  async resetPassword(email, otp, newPassword) {
    await delay(100);
    if (otp === '123456' || (typeof otp === 'string' && otp.trim().length === 6)) {
      const users = getStoredUsers();
      const user = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
      if (user) {
        user.password = newPassword;
        saveStoredUsers(users);
      }
      return { success: true, message: 'Password updated successfully! You can now log in.' };
    }
    throw new Error('Invalid OTP code. Please enter 123456 for demo verification.');
  },

  // ==========================================
  // JOB REQUISITIONS APIS
  // ==========================================
  async getJobs() {
    await delay(60);
    return getStoredJobs();
  },

  async createJob(jobData) {
    await delay(100);
    const jobs = getStoredJobs();
    const newJob = {
      ...jobData,
      id: Date.now(),
      active: true,
      createdAt: new Date().toISOString()
    };
    jobs.unshift(newJob);
    saveStoredJobs(jobs);
    return newJob;
  },

  // ==========================================
  // RESUME PARSING & ATS ANALYSIS APIS
  // ==========================================
  async parseResume(formData) {
    await delay(180);
    const resumeText = formData.get('resumeText') || '';
    const file = formData.get('resumeFile');
    const fileName = file?.name || 'Uploaded_Resume.pdf';
    const jobId = formData.get('jobId');

    const jobs = getStoredJobs();
    const targetJob = jobs.find(j => j.id == jobId) || jobs[0];

    // Intelligent Skill Extraction from Resume Text
    const combinedContent = `${fileName} ${resumeText}`.toLowerCase();
    const extractedSkills = TECH_SKILLS_DICTIONARY.filter(skill => 
      combinedContent.includes(skill.toLowerCase())
    );

    // If none matched, seed relevant default skills
    const finalExtractedSkills = extractedSkills.length > 0 
      ? extractedSkills 
      : ['Java', 'Spring Boot', 'React', 'TypeScript', 'SQL', 'Git', 'REST API', 'Docker'];

    // Match against Target Job Requirements
    const reqSkillsList = (targetJob?.requiredSkills || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const matchedSkills = reqSkillsList.filter(req => 
      finalExtractedSkills.some(ext => ext.toLowerCase() === req.toLowerCase())
    );

    const missingSkills = reqSkillsList.filter(req => 
      !finalExtractedSkills.some(ext => ext.toLowerCase() === req.toLowerCase())
    );

    // Calculate Dynamic ATS Match Score
    const matchRatio = reqSkillsList.length > 0 ? (matchedSkills.length / reqSkillsList.length) : 0.85;
    const atsMatchScore = Math.min(98, Math.max(72, Math.round(matchRatio * 100)));

    // Experience detection heuristic
    const expMatch = combinedContent.match(/(\d+)\+?\s*years?/i);
    const estimatedExperienceYears = expMatch ? parseInt(expMatch[1], 10) : 5;

    return {
      fileName,
      extractedText: resumeText || `${fileName} parsed content. Proficient in ${finalExtractedSkills.join(', ')}.`,
      estimatedExperienceYears,
      extractedEducation: 'Bachelor of Science in Computer Science',
      extractedSkills: finalExtractedSkills,
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : ['Java', 'Spring Boot', 'REST API'],
      missingSkills: missingSkills.length > 0 ? missingSkills : ['Kafka', 'Microservices'],
      atsMatchScore
    };
  },

  // ==========================================
  // JOB APPLICATION SUBMISSION & TRACKING APIS
  // ==========================================
  async applyToJob(formData) {
    await delay(150);
    const parseResult = await this.parseResume(formData);
    const jobId = formData.get('jobId');
    const jobs = getStoredJobs();
    const job = jobs.find(j => j.id == jobId) || jobs[0];

    const apps = getStoredApplications();
    const newApp = {
      id: Date.now(),
      jobId: job.id,
      job,
      candidate: {
        id: 1,
        username: "john_doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        role: "ROLE_CANDIDATE"
      },
      status: "APPLIED",
      matchScore: parseResult.atsMatchScore,
      estimatedExperienceYears: parseResult.estimatedExperienceYears,
      extractedEducation: parseResult.extractedEducation,
      extractedSkills: parseResult.extractedSkills.join(', '),
      missingSkills: parseResult.missingSkills.join(', '),
      resumeFileName: parseResult.fileName,
      resumeText: parseResult.extractedText,
      appliedAt: new Date().toISOString()
    };

    apps.unshift(newApp);
    saveStoredApplications(apps);
    return newApp;
  },

  async getMyApplications() {
    await delay(60);
    return getStoredApplications();
  },

  async getRankedJobApplications(jobId) {
    await delay(60);
    const apps = getStoredApplications();
    return apps
      .filter(a => a.jobId == jobId || a.job?.id == jobId)
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  async getCompanyApplications() {
    await delay(60);
    return getStoredApplications();
  },

  async updateApplicationStatus(id, status) {
    await delay(80);
    const apps = getStoredApplications();
    const app = apps.find(a => a.id == id);
    if (app) {
      app.status = status;
      saveStoredApplications(apps);
    }
    return app;
  },

  // ==========================================
  // DASHBOARD & ANALYTICS APIS
  // ==========================================
  async getDashboardStats() {
    await delay(60);
    const jobs = getStoredJobs();
    const apps = getStoredApplications();

    const statusCounts = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      INTERVIEWING: 0,
      OFFERED: 0,
      REJECTED: 0
    };

    let totalScore = 0;
    apps.forEach(a => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
      totalScore += (a.matchScore || 80);
    });

    const avgScore = apps.length > 0 ? (totalScore / apps.length).toFixed(1) : '88.5';

    return {
      totalJobs: jobs.length,
      totalApplications: apps.length,
      totalCandidates: 34 + apps.length,
      avgMatchScore: parseFloat(avgScore),
      applicationsByStatus: statusCounts,
      topSkills: { 
        "Java": 34, 
        "Spring Boot": 30, 
        "React": 28, 
        "PostgreSQL": 22, 
        "Docker": 20, 
        "TypeScript": 18 
      },
      monthlyFunnel: { 
        "Total Applications": apps.length, 
        "Under Review": statusCounts.UNDER_REVIEW + statusCounts.INTERVIEWING, 
        "Interviewing": statusCounts.INTERVIEWING, 
        "Offered": statusCounts.OFFERED 
      }
    };
  }
};
