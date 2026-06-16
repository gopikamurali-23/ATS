import express from 'express';
import multer from 'multer';
import {
  applyToJob,
  getApplicationById,
  updateStatus,
  getCandidateApplications,
  getCompanyApplications,
  getJobApplications,
  getCandidateProfile,
  updateCandidateProfile,
  getCompanyProfile,
  updateCompanyProfile,
  uploadResumeOnly,
  uploadResumeFromUrl,
  applyToJobFromUrl,
  applyToJobWithExistingResume
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.post('/apply/:jobId', authenticate, authorize('ROLE_CANDIDATE'), upload.single('file'), applyToJob);
router.post('/apply-url/:jobId', authenticate, authorize('ROLE_CANDIDATE'), applyToJobFromUrl);
router.post('/apply-existing/:jobId', authenticate, authorize('ROLE_CANDIDATE'), applyToJobWithExistingResume);
router.post('/resume', authenticate, authorize('ROLE_CANDIDATE'), upload.single('file'), uploadResumeOnly);
router.post('/resume-url', authenticate, authorize('ROLE_CANDIDATE'), uploadResumeFromUrl);
router.get('/candidate', authenticate, authorize('ROLE_CANDIDATE'), getCandidateApplications);
router.get('/company', authenticate, authorize('ROLE_COMPANY'), getCompanyApplications);
router.get('/job/:jobId', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), getJobApplications);
router.get('/profile/candidate', authenticate, authorize('ROLE_CANDIDATE'), getCandidateProfile);
router.put('/profile/candidate', authenticate, authorize('ROLE_CANDIDATE'), updateCandidateProfile);
router.get('/profile/company', authenticate, authorize('ROLE_COMPANY'), getCompanyProfile);
router.put('/profile/company', authenticate, authorize('ROLE_COMPANY'), updateCompanyProfile);
router.get('/:id', authenticate, authorize('ROLE_CANDIDATE', 'ROLE_COMPANY', 'ROLE_ADMIN'), getApplicationById);
router.put('/:id/status', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), updateStatus);

export default router;
