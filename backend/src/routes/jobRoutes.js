import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', verifyToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), updateJob);
router.delete('/:id', verifyToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), deleteJob);

export default router;
