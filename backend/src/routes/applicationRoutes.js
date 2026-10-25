import express from 'express';
import multer from 'multer';
import {
  applyToJob,
  getMyApplications,
  getCompanyApplications,
  getRankedJobApplications,
  updateApplicationStatus
} from '../controllers/applicationController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/apply', upload.single('resumeFile'), applyToJob);
router.get('/my', getMyApplications);
router.get('/company', getCompanyApplications);
router.get('/job/:jobId', getRankedJobApplications);
router.put('/:id/status', updateApplicationStatus);

export default router;
