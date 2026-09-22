const express = require('express');
const router = express.Router();
const multer = require('multer');
const store = require('../db/store');
const { extractTextFromFile, analyzeResume } = require('../services/resumeParser');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Configure Multer for in-memory file handling (up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// POST /api/applications/apply - Submit job application with optional resume file or raw text
router.post('/apply', authenticateToken, requireRole('ROLE_CANDIDATE', 'ROLE_ADMIN'), upload.single('resumeFile'), async (req, res) => {
  try {
    const jobId = req.body.jobId;
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const job = store.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const candidate = req.user;
    const file = req.file;
    const rawResumeText = req.body.resumeText || '';

    const fileName = file ? file.originalname : 'pasted_resume.txt';
    let extractedText = '';
    if (file) {
      extractedText = await extractTextFromFile(file);
    } else {
      extractedText = rawResumeText;
    }

    const parseResult = analyzeResume(fileName, extractedText, job);

    const appData = {
      jobId: job.id,
      job,
      candidate,
      status: 'APPLIED',
      matchScore: parseResult.atsMatchScore,
      estimatedExperienceYears: parseResult.estimatedExperienceYears,
      extractedEducation: parseResult.extractedEducation,
      extractedSkills: parseResult.extractedSkills.join(', '),
      missingSkills: parseResult.missingSkills.join(', '),
      resumeFileName: fileName,
      resumeText: extractedText
    };

    const createdApp = store.createApplication(appData);
    return res.json(createdApp);
  } catch (err) {
    console.error('Error applying to job:', err);
    return res.status(500).json({ message: 'Failed to process application: ' + err.message });
  }
});

// POST /api/applications/parse-resume - Analyze resume standalone without submitting
router.post('/parse-resume', upload.single('resumeFile'), async (req, res) => {
  try {
    const file = req.file;
    const rawResumeText = req.body.resumeText || '';
    const jobId = req.body.jobId;

    const job = jobId ? store.getJobById(jobId) : null;
    const fileName = file ? file.originalname : 'pasted_resume.txt';

    let extractedText = '';
    if (file) {
      extractedText = await extractTextFromFile(file);
    } else {
      extractedText = rawResumeText;
    }

    const result = analyzeResume(fileName, extractedText, job);
    return res.json(result);
  } catch (err) {
    console.error('Error parsing resume:', err);
    return res.status(500).json({ message: 'Failed to parse resume: ' + err.message });
  }
});

// GET /api/applications/my - Get current candidate's applications
router.get('/my', authenticateToken, requireRole('ROLE_CANDIDATE', 'ROLE_ADMIN'), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const candidateApps = store.getCandidateApplications(req.user.id);
  return res.json(candidateApps);
});

// GET /api/applications/job/:jobId/ranked - Get ranked applications for a job (ROLE_COMPANY or ROLE_ADMIN)
router.get('/job/:jobId/ranked', authenticateToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), (req, res) => {
  const ranked = store.getRankedApplicationsForJob(req.params.jobId);
  return res.json(ranked);
});

// GET /api/applications/company - Get applications for company's jobs (ROLE_COMPANY or ROLE_ADMIN)
router.get('/company', authenticateToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), (req, res) => {
  const companyName = (req.user && req.user.companyName) ? req.user.companyName : 'Google';
  const companyApps = store.getCompanyApplications(companyName);
  return res.json(companyApps);
});

// PATCH /api/applications/:id/status - Update application status (ROLE_COMPANY or ROLE_ADMIN)
router.patch('/:id/status', authenticateToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), (req, res) => {
  const status = req.body.status;
  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }
  const updatedApp = store.updateApplicationStatus(req.params.id, status);
  if (!updatedApp) {
    return res.status(404).json({ message: 'Application not found' });
  }
  return res.json(updatedApp);
});

module.exports = router;
