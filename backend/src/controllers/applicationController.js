import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { parseResumeText } from './atsController.js';

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, resumeText } = req.body;
    const file = req.file;
    const fileName = file ? file.originalname : (req.body.fileName || 'Uploaded_Resume.pdf');

    let job = null;
    if (jobId) {
      job = await Job.findById(jobId).catch(() => null);
    }
    if (!job) {
      job = await Job.findOne();
    }

    const parseResult = parseResumeText(resumeText, fileName, job);

    const candidateUser = req.user || {
      id: 1,
      username: 'john_doe',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      role: 'ROLE_CANDIDATE'
    };

    const newApp = await Application.create({
      jobId: job?._id,
      job: {
        id: job?._id?.toString() || '1',
        title: job?.title || 'Senior Software Engineer',
        companyName: job?.companyName || 'Google',
        location: job?.location || 'Remote',
        employmentType: job?.employmentType || 'Full-Time',
        requiredSkills: job?.requiredSkills || '',
        salaryRange: job?.salaryRange || ''
      },
      candidate: {
        id: candidateUser._id?.toString() || '1',
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
    const candidateEmail = req.user?.email || 'john.doe@example.com';
    const apps = await Application.find({
      $or: [
        { 'candidate.email': candidateEmail },
        { 'candidate.id': req.user?._id?.toString() }
      ]
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
    const apps = await Application.find({
      $or: [{ jobId }, { 'job.id': jobId }]
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
