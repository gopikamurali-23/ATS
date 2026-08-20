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
    resumeUrl: app.candidates ? app.candidates.resume_url : '',
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
    dto.missingSkills = res.missing_skills;
    dto.strengths = res.strengths;
    dto.weaknesses = res.weaknesses;
    dto.interviewRecommendation = res.interview_recommendation;
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
          resume_url: absolutePath,
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
          final_ats_score: scoringResult.finalAtsScore,
          candidate_summary: scoringResult.candidateSummary,
          missing_skills: scoringResult.missingSkills,
          strengths: scoringResult.strengths,
          weaknesses: scoringResult.weaknesses,
          interview_recommendation: scoringResult.interviewRecommendation,
          analyzed_at: new Date()
        }
      });

      return { app, result };
    });

    return res.status(200).json(convertToApplicationDto(savedApplication.app, savedApplication.result));
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

    const result = await prisma.ats_results.findUnique({
      where: { application_id: BigInt(id) }
    });

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
      const resVal = await prisma.ats_results.findUnique({
        where: { application_id: app.id }
      });
      list.push(convertToApplicationDto(app, resVal));
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
