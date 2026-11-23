import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { parseResumeText } from './atsController.js';

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, jobTitle, companyName, resumeText, candidateEmail, candidateName, candidateUsername } = req.body;
    const file = req.file;
    const fileName = file ? file.originalname : (req.body.fileName || req.body.resumeFileName || 'Uploaded_Resume.pdf');

    let job = null;
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findById(jobId).catch(() => null);
    }
    if (!job && jobId) {
      job = await Job.findOne({
        $or: [
          { title: jobTitle || jobId },
          { _id: mongoose.Types.ObjectId.isValid(jobId) ? jobId : undefined }
        ].filter(Boolean)
      }).catch(() => null);
    }
    if (!job && jobTitle) {
      job = await Job.findOne({
        title: new RegExp(`^${jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).catch(() => null);
    }
    if (!job && companyName) {
      job = await Job.findOne({
        companyName: new RegExp(`^${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).catch(() => null);
    }
    if (!job) {
      job = await Job.findOne();
    }

    const parseResult = parseResumeText(resumeText, fileName, job);

    const candidateUser = req.user || {
      id: req.body.candidateId || 1,
      username: candidateUsername || (candidateEmail ? candidateEmail.split('@')[0] : 'john_doe'),
      fullName: candidateName || 'John Doe',
      email: candidateEmail || 'john.doe@example.com',
      role: 'ROLE_CANDIDATE'
    };

    const newApp = await Application.create({
      jobId: job?._id || (mongoose.Types.ObjectId.isValid(jobId) ? jobId : undefined),
      job: {
        id: job?._id?.toString() || String(jobId || '1'),
        title: job?.title || jobTitle || 'Senior Software Engineer',
        companyName: job?.companyName || companyName || 'Google',
        location: job?.location || 'Remote',
        employmentType: job?.employmentType || 'Full-Time',
        requiredSkills: job?.requiredSkills || '',
        salaryRange: job?.salaryRange || ''
      },
      candidate: {
        id: candidateUser._id?.toString() || String(candidateUser.id || '1'),
        username: candidateUser.username || 'candidate',
        fullName: candidateUser.fullName || 'Candidate',
        email: candidateUser.email || 'candidate@example.com',
        role: candidateUser.role || 'ROLE_CANDIDATE'
      },
      status: 'APPLIED',
      matchScore: parseResult.atsMatchScore,
      estimatedExperienceYears: parseResult.estimatedExperienceYears,
      extractedEducation: parseResult.extractedEducation,
      extractedSkills: parseResult.extractedSkills.join(', '),
      missingSkills: parseResult.missingSkills.join(', '),
      resumeFileName: parseResult.fileName,
      resumeText: parseResult.extractedText,
      appliedAt: new Date()
    });

    res.status(201).json(newApp);
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const candidateEmail = req.user?.email || req.query.email || 'john.doe@example.com';
    const query = [{ 'candidate.email': candidateEmail }];
    if (req.user?._id) {
      query.push({ 'candidate.id': req.user._id.toString() });
    }

    const apps = await Application.find({
      $or: query
    }).sort({ createdAt: -1 });

    // Fallback: if no apps specifically for this email, return latest demo apps
    if (apps.length === 0) {
      const allApps = await Application.find().sort({ createdAt: -1 }).limit(10);
      return res.json(allApps);
    }

    res.json(apps);
  } catch (error) {
    next(error);
  }
};

export const getCompanyApplications = async (req, res, next) => {
  try {
    const company = req.user?.companyName;
    let query = {};
    if (company && req.user?.role !== 'ROLE_ADMIN') {
      query = { 'job.companyName': new RegExp(`^${company}$`, 'i') };
    }

    const apps = await Application.find(query).sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

export const getRankedJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const query = [
      { 'job.id': String(jobId) }
    ];
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      query.push({ jobId });
    }
    const apps = await Application.find({
      $or: query
    }).sort({ matchScore: -1 });

    res.json(apps);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
