import prisma from '../config/db.js';
import * as resumeParser from '../services/resumeParser.js';
import * as atsScoring from '../services/atsScoring.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const uploadDir = 'uploads/';

export const convertToApplicationDto = (app, res) => {
  if (!app) return null;
  const dto = {
    id: app.id,
    candidateId: app.candidates ? app.candidates.id : app.candidate_id,
    candidateName: app.candidates ? `${app.candidates.first_name} ${app.candidates.last_name}` : '',
    candidateEmail: app.candidates && app.candidates.users ? app.candidates.users.email : '',
    candidatePhone: app.candidates ? app.candidates.phone : '',
    candidateTitle: app.candidates ? app.candidates.title : '',
    resumeUrl: app.candidates && app.candidates.resume_url ? `/uploads/${path.basename(app.candidates.resume_url)}` : '',
    jobId: app.jobs ? app.jobs.id : app.job_id,
    jobTitle: app.jobs ? app.jobs.title : '',
    companyName: app.jobs && app.jobs.companies ? app.jobs.companies.name : '',
    status: app.status,
    appliedAt: app.applied_at,
    analyzed: !!res
  };

  if (res) {
    dto.skillMatchScore = res.skill_match_score;
    dto.experienceMatchScore = res.experience_match_score;
    dto.educationMatchScore = res.education_match_score;
    dto.keywordMatchScore = res.keyword_match_score;
    dto.finalAtsScore = res.final_ats_score;
    dto.candidateSummary = res.candidate_summary;
    dto.missingSkills = res.missing_skills ? res.missing_skills.split(', ').filter(s => s && s !== 'None') : [];
    dto.strengths = res.strengths ? res.strengths.split('. ').filter(Boolean) : [];
    dto.weaknesses = res.weaknesses ? res.weaknesses.split('. ').filter(Boolean) : [];
    dto.interviewRecommendation = res.interview_recommendation;

    // Detailed Category Fields
    dto.formatMatchScore = res.format_match_score ?? 0;
    dto.projectMatchScore = res.project_match_score ?? 0;
    dto.certificationMatchScore = res.certification_match_score ?? 0;
    dto.missingKeywords = res.missing_keywords ? res.missing_keywords.split(', ').filter(Boolean) : [];
    dto.recommendedCertifications = res.recommended_certifications ? res.recommended_certifications.split(', ').filter(Boolean) : [];
    dto.improvementSuggestions = res.improvement_suggestions ? res.improvement_suggestions.split('. ').filter(Boolean) : [];
    
    dto.communicationMatchScore = res.communication_match_score ?? 0;
    dto.skillBySkillScores = res.skill_by_skill_scores ? JSON.parse(res.skill_by_skill_scores) : {};
    dto.projectScoresBreakdown = res.project_scores_breakdown ? JSON.parse(res.project_scores_breakdown) : {};
    dto.interviewSuccessProbability = res.interview_success_probability ?? 0;
    dto.hiringSuccessProbability = res.hiring_success_probability ?? 0;
    dto.weakSkills = res.weak_skills ? res.weak_skills.split(', ').filter(Boolean) : [];
    dto.strongSkills = res.strong_skills ? res.strong_skills.split(', ').filter(Boolean) : [];

    // Duplicate property names for exact JSON API format compatibility
    dto.overallScore = res.final_ats_score;
    dto.skillsScore = res.skill_match_score;
    dto.experienceScore = res.experience_match_score;
    dto.educationScore = res.education_match_score;
    dto.keywordScore = res.keyword_match_score;
    dto.formatScore = res.format_match_score ?? 0;
    dto.projectScore = res.project_match_score ?? 0;
    dto.certificationScore = res.certification_match_score ?? 0;
    dto.recommendations = dto.improvementSuggestions;
  }

  return dto;
};

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Error: No file uploaded' });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id },
      include: { users: true }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(jobId) },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' });
    }

    // Check if candidate already applied
    const existingApp = await prisma.applications.findFirst({
      where: {
        candidate_id: candidate.id,
        job_id: BigInt(jobId)
      }
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Save file to uploads directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalFilename = file.originalname;
    const extension = originalFilename && originalFilename.includes('.')
      ? originalFilename.substring(originalFilename.lastIndexOf('.'))
      : '.pdf';

    const newFilename = `${crypto.randomUUID()}${extension}`;
    const relativePath = path.join(uploadDir, newFilename);
    const absolutePath = path.resolve(relativePath);

    fs.writeFileSync(relativePath, file.buffer);

    // Parse resume content
    const resumeText = await resumeParser.extractText(file);

    // Score application using ATS Scoring Service
    const scoringResult = atsScoring.analyzeApplication(resumeText, {
      skillsRequired: job.job_skills.map(s => s.skill),
      experienceRequiredYears: job.experience_required_years,
      educationRequired: job.education_required,
      keywords: job.job_keywords.map(k => k.keyword)
    }, candidate);

    // Save everything transactionally
    const savedApplication = await prisma.$transaction(async (tx) => {
      // 1. Update candidate resume URL and parsed title
      await tx.candidates.update({
        where: { id: candidate.id },
        data: {
          resume_url: `/uploads/${newFilename}`,
          title: scoringResult.parsedExperience.length === 0 ? 'Professional' : scoringResult.parsedExperience[0]
        }
      });

      // 2. Re-create candidate skills
      await tx.candidate_skills.deleteMany({ where: { candidate_id: candidate.id } });
      for (const skill of scoringResult.parsedSkills) {
        // Safe check for duplicate candidate skills (since @@id unique constraint is candidate_id + skill)
        const exists = await tx.candidate_skills.findUnique({
          where: { candidate_id_skill: { candidate_id: candidate.id, skill } }
        });
        if (!exists) {
          await tx.candidate_skills.create({
            data: { candidate_id: candidate.id, skill }
          });
        }
      }

      // 3. Re-create candidate education
      await tx.candidate_education.deleteMany({ where: { candidate_id: candidate.id } });
      for (const edu of scoringResult.parsedEducation) {
        const exists = await tx.candidate_education.findUnique({
          where: { candidate_id_education_entry: { candidate_id: candidate.id, education_entry: edu } }
        });
        if (!exists) {
          await tx.candidate_education.create({
            data: { candidate_id: candidate.id, education_entry: edu }
          });
        }
      }

      // 4. Re-create candidate experience
      await tx.candidate_experience.deleteMany({ where: { candidate_id: candidate.id } });
      for (const exp of scoringResult.parsedExperience) {
        const exists = await tx.candidate_experience.findUnique({
          where: { candidate_id_experience_entry: { candidate_id: candidate.id, experience_entry: exp } }
        });
        if (!exists) {
          await tx.candidate_experience.create({
            data: { candidate_id: candidate.id, experience_entry: exp }
          });
        }
      }

      // 5. Create application record
      const app = await tx.applications.create({
        data: {
          candidate_id: candidate.id,
          job_id: BigInt(jobId),
          status: 'APPLIED',
          resume_text: resumeText,
          applied_at: new Date()
        },
        include: {
          candidates: { include: { users: true } },
          jobs: { include: { companies: true } }
        }
      });

      // 6. Save ATS Result
      const result = await tx.ats_results.create({
        data: {
          application_id: app.id,
          skill_match_score: scoringResult.skillMatchScore,
          experience_match_score: scoringResult.experienceMatchScore,
          education_match_score: scoringResult.educationMatchScore,
          keyword_match_score: scoringResult.keywordMatchScore,
          format_match_score: scoringResult.formatMatchScore,
          project_match_score: scoringResult.projectMatchScore,
          certification_match_score: scoringResult.certificationMatchScore,
          missing_keywords: scoringResult.missingKeywords,
          recommended_certifications: scoringResult.recommendedCertifications,
          improvement_suggestions: scoringResult.improvementSuggestions,
          final_ats_score: scoringResult.finalAtsScore,
          candidate_summary: scoringResult.candidateSummary,
          missing_skills: scoringResult.missingSkills,
          strengths: scoringResult.strengths,
          weaknesses: scoringResult.weaknesses,
          interview_recommendation: scoringResult.interviewRecommendation,
          communication_match_score: scoringResult.communicationMatchScore,
          skill_by_skill_scores: scoringResult.skillBySkillScores,
          project_scores_breakdown: scoringResult.projectScoresBreakdown,
          interview_success_probability: scoringResult.interviewSuccessProbability,
          hiring_success_probability: scoringResult.hiringSuccessProbability,
          weak_skills: scoringResult.weakSkills,
          strong_skills: scoringResult.strongSkills,
          analyzed_at: new Date()
        }
      });

      return { app, result };
    });

    return res.status(200).json(convertToApplicationDto(savedApplication.app, null));
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const app = await prisma.applications.findUnique({
      where: { id: BigInt(id) },
      include: {
        candidates: { include: { users: true } },
        jobs: { include: { companies: true } }
      }
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let result = null;
    if (req.user.role !== 'ROLE_CANDIDATE') {
      result = await prisma.ats_results.findUnique({
        where: { application_id: BigInt(id) }
      });
    }

    return res.status(200).json(convertToApplicationDto(app, result));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: 'Status parameter is required' });
    }

    const app = await prisma.applications.findUnique({
      where: { id: BigInt(id) }
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updated = await prisma.applications.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        candidates: { include: { users: true } },
        jobs: { include: { companies: true } }
      }
    });

    const result = await prisma.ats_results.findUnique({
      where: { application_id: BigInt(id) }
    });

    return res.status(200).json(convertToApplicationDto(updated, result));
  } catch (error) {
    next(error);
  }
};

export const getCandidateApplications = async (req, res, next) => {
  try {
    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const apps = await prisma.applications.findMany({
      where: { candidate_id: candidate.id },
      include: {
        candidates: { include: { users: true } },
        jobs: { include: { companies: true } }
      }
    });

    const list = [];
    for (const app of apps) {
      list.push(convertToApplicationDto(app, null));
    }

    return res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const getCompanyApplications = async (req, res, next) => {
  try {
    const company = await prisma.companies.findUnique({
      where: { user_id: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const apps = await prisma.applications.findMany({
      where: {
        jobs: { company_id: company.id }
      },
      include: {
        candidates: { include: { users: true } },
        jobs: { include: { companies: true } }
      }
    });

    const list = [];
    for (const app of apps) {
      const resVal = await prisma.ats_results.findUnique({
        where: { application_id: app.id }
      });
      list.push(convertToApplicationDto(app, resVal));
    }

    // Sort by finalAtsScore descending
    list.sort((a, b) => (b.finalAtsScore || 0) - (a.finalAtsScore || 0));

    return res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const apps = await prisma.applications.findMany({
      where: { job_id: BigInt(jobId) },
      include: {
        candidates: { include: { users: true } },
        jobs: { include: { companies: true } }
      }
    });

    const list = [];
    for (const app of apps) {
      const resVal = await prisma.ats_results.findUnique({
        where: { application_id: app.id }
      });
      list.push(convertToApplicationDto(app, resVal));
    }

    // Sort by finalAtsScore descending
    list.sort((a, b) => (b.finalAtsScore || 0) - (a.finalAtsScore || 0));

    return res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const getCandidateProfile = async (req, res, next) => {
  try {
    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id },
      include: {
        candidate_skills: true,
        candidate_education: true,
        candidate_experience: true,
        users: true
      }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    return res.status(200).json(candidate);
  } catch (error) {
    next(error);
  }
};

export const updateCandidateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone, title, skills, education, experience } = req.body;

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.candidates.update({
        where: { id: candidate.id },
        data: {
          first_name: first_name !== undefined ? first_name : candidate.first_name,
          last_name: last_name !== undefined ? last_name : candidate.last_name,
          phone: phone !== undefined ? phone : candidate.phone,
          title: title !== undefined ? title : candidate.title,
        }
      });

      if (skills && Array.isArray(skills)) {
        await tx.candidate_skills.deleteMany({ where: { candidate_id: candidate.id } });
        for (const skill of skills) {
          const exists = await tx.candidate_skills.findUnique({
            where: { candidate_id_skill: { candidate_id: candidate.id, skill } }
          });
          if (!exists) {
            await tx.candidate_skills.create({
              data: { candidate_id: candidate.id, skill }
            });
          }
        }
      }

      if (education && Array.isArray(education)) {
        await tx.candidate_education.deleteMany({ where: { candidate_id: candidate.id } });
        for (const edu of education) {
          const exists = await tx.candidate_education.findUnique({
            where: { candidate_id_education_entry: { candidate_id: candidate.id, education_entry: edu } }
          });
          if (!exists) {
            await tx.candidate_education.create({
              data: { candidate_id: candidate.id, education_entry: edu }
            });
          }
        }
      }

      if (experience && Array.isArray(experience)) {
        await tx.candidate_experience.deleteMany({ where: { candidate_id: candidate.id } });
        for (const exp of experience) {
          const exists = await tx.candidate_experience.findUnique({
            where: { candidate_id_experience_entry: { candidate_id: candidate.id, experience_entry: exp } }
          });
          if (!exists) {
            await tx.candidate_experience.create({
              data: { candidate_id: candidate.id, experience_entry: exp }
            });
          }
        }
      }

      return c;
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const company = await prisma.companies.findUnique({
      where: { user_id: req.user.id },
      include: { users: true }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    return res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  try {
    const { name, industry, location, website, description } = req.body;

    const company = await prisma.companies.findUnique({
      where: { user_id: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const updated = await prisma.companies.update({
      where: { id: company.id },
      data: {
        name: name !== undefined ? name : company.name,
        industry: industry !== undefined ? industry : company.industry,
        location: location !== undefined ? location : company.location,
        website: website !== undefined ? website : company.website,
        description: description !== undefined ? description : company.description,
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const uploadResumeOnly = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalFilename = file.originalname;
    const extension = originalFilename && originalFilename.includes('.')
      ? originalFilename.substring(originalFilename.lastIndexOf('.'))
      : '.pdf';

    const newFilename = `${crypto.randomUUID()}${extension}`;
    const relativePath = path.join(uploadDir, newFilename);

    fs.writeFileSync(relativePath, file.buffer);

    // Extract text
    const resumeText = await resumeParser.extractText(file);
    const parsedSkills = resumeParser.extractSkills(resumeText);
    const parsedTitle = resumeParser.extractExperience(resumeText)[0] || 'Professional';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update candidate resume url
      const updatedCand = await tx.candidates.update({
        where: { id: candidate.id },
        data: {
          resume_url: `/uploads/${newFilename}`,
          title: parsedTitle
        }
      });

      // 2. Re-create candidate skills
      await tx.candidate_skills.deleteMany({ where: { candidate_id: candidate.id } });
      for (const skill of parsedSkills) {
        const exists = await tx.candidate_skills.findUnique({
          where: { candidate_id_skill: { candidate_id: candidate.id, skill } }
        });
        if (!exists) {
          await tx.candidate_skills.create({
            data: { candidate_id: candidate.id, skill }
          });
        }
      }

      return updatedCand;
    });

    return res.status(200).json({
      message: 'Resume uploaded and parsed successfully!',
      resumeUrl: `/uploads/${newFilename}`,
      title: result.title
    });
  } catch (error) {
    next(error);
  }
};

export const uploadResumeFromUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL parameter is required' });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    // Download file from URL
    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) {
      return res.status(400).json({ message: `Failed to fetch file from the provided URL. Status: ${fetchResponse.status}` });
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Determine extension from content-type or filename
    let extension = '.pdf'; // default
    const contentType = fetchResponse.headers.get('content-type') || '';
    
    // Parse filename from URL
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const originalFilename = pathname.split('/').pop() || 'resume.pdf';

    if (contentType.includes('application/pdf') || originalFilename.toLowerCase().endsWith('.pdf')) {
      extension = '.pdf';
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || originalFilename.toLowerCase().endsWith('.docx')) {
      extension = '.docx';
    } else if (contentType.includes('application/msword') || originalFilename.toLowerCase().endsWith('.doc')) {
      extension = '.doc';
    } else {
      const lastDot = originalFilename.lastIndexOf('.');
      if (lastDot !== -1) {
        extension = originalFilename.substring(lastDot).toLowerCase();
      }
    }

    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
      return res.status(400).json({ message: 'Unsupported file format at URL. Only PDF, DOC, and DOCX are supported.' });
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFilename = `${crypto.randomUUID()}${extension}`;
    const relativePath = path.join(uploadDir, newFilename);

    fs.writeFileSync(relativePath, fileBuffer);

    // Create a mock file object for resumeParser
    const mockFile = {
      originalname: originalFilename.includes('.') ? originalFilename : `resume${extension}`,
      buffer: fileBuffer
    };

    // Extract text
    const resumeText = await resumeParser.extractText(mockFile);
    const parsedSkills = resumeParser.extractSkills(resumeText);
    const parsedTitle = resumeParser.extractExperience(resumeText)[0] || 'Professional';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update candidate resume url
      const updatedCand = await tx.candidates.update({
        where: { id: candidate.id },
        data: {
          resume_url: `/uploads/${newFilename}`,
          title: parsedTitle
        }
      });

      // 2. Re-create candidate skills
      await tx.candidate_skills.deleteMany({ where: { candidate_id: candidate.id } });
      for (const skill of parsedSkills) {
        const exists = await tx.candidate_skills.findUnique({
          where: { candidate_id_skill: { candidate_id: candidate.id, skill } }
        });
        if (!exists) {
          await tx.candidate_skills.create({
            data: { candidate_id: candidate.id, skill }
          });
        }
      }

      return updatedCand;
    });

    return res.status(200).json({
      message: 'Resume from URL uploaded and parsed successfully!',
      resumeUrl: `/uploads/${newFilename}`,
      title: result.title
    });
  } catch (error) {
    next(error);
  }
};

export const applyToJobFromUrl = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL parameter is required' });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id },
      include: { users: true }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(jobId) },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' });
    }

    // Check if candidate already applied
    const existingApp = await prisma.applications.findFirst({
      where: {
        candidate_id: candidate.id,
        job_id: BigInt(jobId)
      }
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Download file from URL
    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) {
      return res.status(400).json({ message: `Failed to fetch file from the provided URL. Status: ${fetchResponse.status}` });
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Determine extension from content-type or filename
    let extension = '.pdf'; // default
    const contentType = fetchResponse.headers.get('content-type') || '';
    
    // Parse filename from URL
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const originalFilename = pathname.split('/').pop() || 'resume.pdf';

    if (contentType.includes('application/pdf') || originalFilename.toLowerCase().endsWith('.pdf')) {
      extension = '.pdf';
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || originalFilename.toLowerCase().endsWith('.docx')) {
      extension = '.docx';
    } else if (contentType.includes('application/msword') || originalFilename.toLowerCase().endsWith('.doc')) {
      extension = '.doc';
    } else {
      const lastDot = originalFilename.lastIndexOf('.');
      if (lastDot !== -1) {
        extension = originalFilename.substring(lastDot).toLowerCase();
      }
    }

    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
      return res.status(400).json({ message: 'Unsupported file format at URL. Only PDF, DOC, and DOCX are supported.' });
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFilename = `${crypto.randomUUID()}${extension}`;
    const relativePath = path.join(uploadDir, newFilename);

    fs.writeFileSync(relativePath, fileBuffer);

    // Create a mock file object for resumeParser
    const mockFile = {
      originalname: originalFilename.includes('.') ? originalFilename : `resume${extension}`,
      buffer: fileBuffer
    };

    // Parse resume content
    const resumeText = await resumeParser.extractText(mockFile);

    // Score application using ATS Scoring Service
    const scoringResult = atsScoring.analyzeApplication(resumeText, {
      skillsRequired: job.job_skills.map(s => s.skill),
      experienceRequiredYears: job.experience_required_years,
      educationRequired: job.education_required,
      keywords: job.job_keywords.map(k => k.keyword)
    }, candidate);

    // Save everything transactionally
    const savedApplication = await prisma.$transaction(async (tx) => {
      // 1. Update candidate resume URL and parsed title
      await tx.candidates.update({
        where: { id: candidate.id },
        data: {
          resume_url: `/uploads/${newFilename}`,
          title: scoringResult.parsedExperience.length === 0 ? 'Professional' : scoringResult.parsedExperience[0]
        }
      });

      // 2. Re-create candidate skills
      await tx.candidate_skills.deleteMany({ where: { candidate_id: candidate.id } });
      for (const skill of scoringResult.parsedSkills) {
        const exists = await tx.candidate_skills.findUnique({
          where: { candidate_id_skill: { candidate_id: candidate.id, skill } }
        });
        if (!exists) {
          await tx.candidate_skills.create({
            data: { candidate_id: candidate.id, skill }
          });
        }
      }

      // 3. Re-create candidate education
      await tx.candidate_education.deleteMany({ where: { candidate_id: candidate.id } });
      for (const edu of scoringResult.parsedEducation) {
        const exists = await tx.candidate_education.findUnique({
          where: { candidate_id_education_entry: { candidate_id: candidate.id, education_entry: edu } }
        });
        if (!exists) {
          await tx.candidate_education.create({
            data: { candidate_id: candidate.id, education_entry: edu }
          });
        }
      }

      // 4. Re-create candidate experience
      await tx.candidate_experience.deleteMany({ where: { candidate_id: candidate.id } });
      for (const exp of scoringResult.parsedExperience) {
        const exists = await tx.candidate_experience.findUnique({
          where: { candidate_id_experience_entry: { candidate_id: candidate.id, experience_entry: exp } }
        });
        if (!exists) {
          await tx.candidate_experience.create({
            data: { candidate_id: candidate.id, experience_entry: exp }
          });
        }
      }

      // 5. Create application record
      const app = await tx.applications.create({
        data: {
          candidate_id: candidate.id,
          job_id: BigInt(jobId),
          status: 'APPLIED',
          resume_text: resumeText,
          applied_at: new Date()
        },
        include: {
          candidates: { include: { users: true } },
          jobs: { include: { companies: true } }
        }
      });

      // 6. Save ATS Result
      const result = await tx.ats_results.create({
        data: {
          application_id: app.id,
          skill_match_score: scoringResult.skillMatchScore,
          experience_match_score: scoringResult.experienceMatchScore,
          education_match_score: scoringResult.educationMatchScore,
          keyword_match_score: scoringResult.keywordMatchScore,
          format_match_score: scoringResult.formatMatchScore,
          project_match_score: scoringResult.projectMatchScore,
          certification_match_score: scoringResult.certificationMatchScore,
          missing_keywords: scoringResult.missingKeywords,
          recommended_certifications: scoringResult.recommendedCertifications,
          improvement_suggestions: scoringResult.improvementSuggestions,
          final_ats_score: scoringResult.finalAtsScore,
          candidate_summary: scoringResult.candidateSummary,
          missing_skills: scoringResult.missingSkills,
          strengths: scoringResult.strengths,
          weaknesses: scoringResult.weaknesses,
          interview_recommendation: scoringResult.interviewRecommendation,
          communication_match_score: scoringResult.communicationMatchScore,
          skill_by_skill_scores: scoringResult.skillBySkillScores,
          project_scores_breakdown: scoringResult.projectScoresBreakdown,
          interview_success_probability: scoringResult.interviewSuccessProbability,
          hiring_success_probability: scoringResult.hiringSuccessProbability,
          weak_skills: scoringResult.weakSkills,
          strong_skills: scoringResult.strongSkills,
          analyzed_at: new Date()
        }
      });

      return { app, result };
    });

    return res.status(200).json(convertToApplicationDto(savedApplication.app, null));
  } catch (error) {
    next(error);
  }
};

export const applyToJobWithExistingResume = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id },
      include: { users: true }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    if (!candidate.resume_url) {
      return res.status(400).json({ message: 'No active resume found on your profile. Please upload or import a resume first.' });
    }

    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(jobId) },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' });
    }

    // Check if candidate already applied
    const existingApp = await prisma.applications.findFirst({
      where: {
        candidate_id: candidate.id,
        job_id: BigInt(jobId)
      }
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Find local file path
    const relativePath = candidate.resume_url.startsWith('/') 
      ? candidate.resume_url.substring(1) 
      : candidate.resume_url;
      
    const absolutePath = path.resolve(relativePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(400).json({ message: 'Resume document file could not be found on the server. Please re-upload your resume.' });
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const mockFile = {
      originalname: path.basename(candidate.resume_url),
      buffer: fileBuffer
    };

    // Parse resume content
    const resumeText = await resumeParser.extractText(mockFile);

    // Score application using ATS Scoring Service
    const scoringResult = atsScoring.analyzeApplication(resumeText, {
      skillsRequired: job.job_skills.map(s => s.skill),
      experienceRequiredYears: job.experience_required_years,
      educationRequired: job.education_required,
      keywords: job.job_keywords.map(k => k.keyword)
    }, candidate);

    // Save everything transactionally
    const savedApplication = await prisma.$transaction(async (tx) => {
      // 1. Create application record
      const app = await tx.applications.create({
        data: {
          candidate_id: candidate.id,
          job_id: BigInt(jobId),
          status: 'APPLIED',
          resume_text: resumeText,
          applied_at: new Date()
        },
        include: {
          candidates: { include: { users: true } },
          jobs: { include: { companies: true } }
        }
      });

      // 2. Save ATS Result
      const result = await tx.ats_results.create({
        data: {
          application_id: app.id,
          skill_match_score: scoringResult.skillMatchScore,
          experience_match_score: scoringResult.experienceMatchScore,
          education_match_score: scoringResult.educationMatchScore,
          keyword_match_score: scoringResult.keywordMatchScore,
          format_match_score: scoringResult.formatMatchScore,
          project_match_score: scoringResult.projectMatchScore,
          certification_match_score: scoringResult.certificationMatchScore,
          missing_keywords: scoringResult.missingKeywords,
          recommended_certifications: scoringResult.recommendedCertifications,
          improvement_suggestions: scoringResult.improvementSuggestions,
          final_ats_score: scoringResult.finalAtsScore,
          candidate_summary: scoringResult.candidateSummary,
          missing_skills: scoringResult.missingSkills,
          strengths: scoringResult.strengths,
          weaknesses: scoringResult.weaknesses,
          interview_recommendation: scoringResult.interviewRecommendation,
          communication_match_score: scoringResult.communicationMatchScore,
          skill_by_skill_scores: scoringResult.skillBySkillScores,
          project_scores_breakdown: scoringResult.projectScoresBreakdown,
          interview_success_probability: scoringResult.interviewSuccessProbability,
          hiring_success_probability: scoringResult.hiringSuccessProbability,
          weak_skills: scoringResult.weakSkills,
          strong_skills: scoringResult.strongSkills,
          analyzed_at: new Date()
        }
      });

      return { app, result };
    });

    return res.status(200).json(convertToApplicationDto(savedApplication.app, null));
  } catch (error) {
    next(error);
  }
};
