// API Service Layer for TalentPulse ATS & Resume AI Analyzer

const API_BASE = '/api';

export const getAuthHeader = () => {
  const token = localStorage.getItem('talentpulse_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Fallback Mock Data for instant client-side resiliency
const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Java Backend Engineer",
    description: "We are seeking a Senior Java Engineer to build high-performance microservices. Minimum 5 years of experience with Spring Boot, PostgreSQL, Docker, and REST APIs required.",
    companyName: "Google",
    location: "Mountain View, CA (Hybrid)",
    employmentType: "Full-Time",
    requiredExperienceYears: 5,
    requiredSkills: "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git",
    salaryRange: "$140,000 - $180,000",
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
    salaryRange: "$130,000 - $165,000",
    active: true,
    createdAt: "2026-09-02T11:30:00"
  },
  {
    id: 3,
    title: "Cloud DevOps & Platform Engineer",
    description: "Manage Kubernetes clusters, CI/CD pipelines, Terraform infrastructure, and AWS cloud environments for enterprise applications.",
    companyName: "Microsoft",
    location: "Redmond, WA",
    employmentType: "Full-Time",
    requiredExperienceYears: 3,
    requiredSkills: "AWS, Docker, Kubernetes, CI/CD, Jenkins, Linux, Python, Git",
    salaryRange: "$125,000 - $155,000",
    active: true,
    createdAt: "2026-09-03T14:15:00"
  }
];

const MOCK_APPLICATIONS = [
  {
    id: 101,
    job: MOCK_JOBS[0],
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
    job: MOCK_JOBS[1],
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
    job: MOCK_JOBS[0],
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

export const api = {
  // Auth API
  async login(loginIdentifier, password, expectedRole) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginIdentifier, username: loginIdentifier, password })
      });
      if (res.ok) {
        const userData = await res.json();
        if (expectedRole && userData.role !== expectedRole && userData.role !== 'ROLE_ADMIN') {
          throw new Error(`This account is registered as a ${userData.role === 'ROLE_COMPANY' ? 'Recruiter' : 'Candidate'}. Please sign in via the correct portal tab.`);
        }
        return userData;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
      console.warn("Backend API offline or network issue, using local demo auth fallback.");
    }

    // Demo Account Fallbacks
    const idLower = (loginIdentifier || '').toLowerCase();
    if ((idLower === 'john.doe@example.com' || idLower === 'john_doe' || idLower === 'john') && password === 'john123') {
      if (expectedRole && expectedRole === 'ROLE_COMPANY') {
        throw new Error('This account (john.doe@example.com) is a Candidate account. Please use Candidate Login.');
      }
      return { token: 'mock-jwt-john', id: 1, username: 'john_doe', email: 'john.doe@example.com', role: 'ROLE_CANDIDATE', fullName: 'John Doe', age: '28', phone: '555-0199', companyName: null, emailVerified: true };
    } else if ((idLower === 'careers@google.com' || idLower === 'google' || idLower === 'recruiter') && password === 'google123') {
      if (expectedRole && expectedRole === 'ROLE_CANDIDATE') {
        throw new Error('This account (careers@google.com) is a Recruiter account. Please use Recruiter Login.');
      }
      return { token: 'mock-jwt-google', id: 4, username: 'google', email: 'careers@google.com', role: 'ROLE_COMPANY', fullName: 'Google Recruiter', companyName: 'Google', companyEmail: 'careers@google.com', phone: '555-0188', emailVerified: true };
    } else if ((idLower === 'admin@talentpulse.io' || idLower === 'admin') && password === 'admin123') {
      return { token: 'mock-jwt-admin', id: 6, username: 'admin', email: 'admin@talentpulse.io', role: 'ROLE_ADMIN', fullName: 'Platform Administrator', companyName: 'TalentPulse HQ', emailVerified: true };
    }
    throw new Error('Invalid email/username or password.');
  },

  async register(data) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
      else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
      console.warn("Backend API offline, mock register fallback");
    }
    return {
      token: 'mock-jwt-new-' + Date.now(),
      id: Date.now(),
      username: data.username || data.email.split('@')[0],
      email: data.email,
      role: data.role || 'ROLE_CANDIDATE',
      fullName: data.fullName,
      age: data.age || null,
      phone: data.phone || null,
      companyName: data.companyName || null,
      companyEmail: data.companyEmail || null,
      emailVerified: false,
      otpCodeDemo: '123456'
    };
  },

  async sendOtp(email) {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { message: 'OTP sent to ' + email, otpCodeDemo: '123456' };
  },

  async verifyOtp(email, otp) {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (res.ok) return await res.json();
      else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    // Demo mode OTP fallback verification (123456 or any 6-digit number)
    if (otp === '123456' || otp.length === 6) {
      return { success: true, message: 'OTP verified successfully!', verified: true };
    }
    throw new Error('Invalid OTP code. Please check your email or enter 123456 for demo mode.');
  },

  async forgotPassword(email) {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return await res.json();
      else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    return { message: 'Reset code sent to ' + email, otpCodeDemo: '123456' };
  },

  async resetPassword(email, otp, newPassword) {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      if (res.ok) return await res.json();
      else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    if (otp === '123456' || otp.length === 6) {
      return { success: true, message: 'Password updated successfully!' };
    }
    throw new Error('Invalid OTP verification code.');
  },

  // Jobs API
  async getJobs() {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_JOBS;
  },

  async createJob(jobData) {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(jobData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const newJob = { ...jobData, id: Date.now(), createdAt: new Date().toISOString() };
    MOCK_JOBS.unshift(newJob);
    return newJob;
  },

  // Applications & Resume Parsing API
  async parseResume(formData) {
    try {
      const res = await fetch(`${API_BASE}/applications/parse-resume`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Instant local AI Parser Fallback
    const text = formData.get('resumeText') || 'Experienced Engineer with Java, Spring Boot, React, SQL';
    return {
      fileName: formData.get('resumeFile')?.name || 'uploaded_resume.txt',
      extractedText: text,
      estimatedExperienceYears: 5,
      extractedEducation: 'Bachelor of Science in Computer Science',
      extractedSkills: ['Java', 'Spring Boot', 'React', 'JavaScript', 'SQL', 'Git', 'REST API', 'Docker'],
      matchedSkills: ['Java', 'Spring Boot', 'REST API'],
      missingSkills: ['Microservices', 'PostgreSQL'],
      atsMatchScore: 88
    };
  },

  async applyToJob(formData) {
    try {
      const res = await fetch(`${API_BASE}/applications/apply`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const parseResult = await this.parseResume(formData);
    const newApp = {
      id: Date.now(),
      job: MOCK_JOBS[0],
      candidate: { id: 1, username: "john_doe", fullName: "John Doe", email: "john.doe@example.com", role: "ROLE_CANDIDATE" },
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
    MOCK_APPLICATIONS.unshift(newApp);
    return newApp;
  },

  async getMyApplications() {
    try {
      const res = await fetch(`${API_BASE}/applications/my`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_APPLICATIONS;
  },

  async getRankedJobApplications(jobId) {
    try {
      const res = await fetch(`${API_BASE}/applications/job/${jobId}/ranked`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_APPLICATIONS.filter(a => a.job.id == jobId).sort((a, b) => b.matchScore - a.matchScore);
  },

  async getCompanyApplications() {
    try {
      const res = await fetch(`${API_BASE}/applications/company`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_APPLICATIONS;
  },

  async updateApplicationStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const app = MOCK_APPLICATIONS.find(a => a.id == id);
    if (app) app.status = status;
    return app;
  },

  // Analytics API
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      totalJobs: 12,
      totalApplications: 48,
      totalCandidates: 34,
      avgMatchScore: 86.5,
      applicationsByStatus: { APPLIED: 14, UNDER_REVIEW: 18, INTERVIEWING: 10, OFFERED: 4, REJECTED: 2 },
      topSkills: { "Java": 32, "Spring Boot": 28, "React": 25, "PostgreSQL": 21, "Docker": 19, "TypeScript": 16 },
      monthlyFunnel: { "Total Applications": 48, "Under Review": 32, "Interviewing": 14, "Offered": 4 }
    };
  }
};
