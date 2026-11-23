import express from 'express';
import multer from 'multer';
import {
  applyToJob,
  getMyApplications,
  getCompanyApplications,
  getRankedJobApplications,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/apply', optionalAuth, upload.single('resumeFile'), applyToJob);
router.get('/my', optionalAuth, getMyApplications);
router.get('/company', optionalAuth, getCompanyApplications);
router.get('/job/:jobId', getRankedJobApplications);
router.put('/:id/status', updateApplicationStatus);

export default router;
