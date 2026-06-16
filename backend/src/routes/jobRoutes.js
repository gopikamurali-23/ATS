import express from 'express';
import {
  getActiveJobs,
  getAllJobs,
  getJobById,
  getJobsByCompany,
  searchJobs,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getActiveJobs);
router.get('/all', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), getAllJobs);
router.get('/search', authenticate, searchJobs);
router.get('/:id', authenticate, getJobById);
router.get('/company/:companyId', authenticate, getJobsByCompany);
router.post('/', authenticate, authorize('ROLE_COMPANY'), createJob);
router.put('/:id', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), updateJob);
router.delete('/:id', authenticate, authorize('ROLE_COMPANY', 'ROLE_ADMIN'), deleteJob);

export default router;
