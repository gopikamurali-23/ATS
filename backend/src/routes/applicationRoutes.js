import express from 'express';
import multer from 'multer';
import {
  applyToJob,
  getApplicationById,
  updateStatus,
  getCandidateApplications,
  getCompanyApplications,
  getJobApplications
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.post('/apply/:jobId', authenticate, authorize('ROLE_CANDIDATE'), upload.single('file'), applyToJob);
router.get('/candidate', authenticate, authorize('ROLE_CANDIDATE'), getCandidateApplications);
router.get('/company', authenticate, authorize('ROLE_COMPANY'), getCompanyApplications);
router.get('/job/:jobId', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), getJobApplications);
router.get('/:id', authenticate, authorize('ROLE_CANDIDATE', 'ROLE_COMPANY', 'ROLE_ADMIN'), getApplicationById);
router.put('/:id/status', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), updateStatus);

export default router;
