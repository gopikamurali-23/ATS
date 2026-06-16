import express from 'express';
import {
  getSystemAnalytics,
  getAllUsers,
  deleteUser,
  getAllCompanies,
  getAllJobs,
  getAllApplications
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize('ROLE_ADMIN'));

router.get('/analytics', getSystemAnalytics);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/companies', getAllCompanies);
router.get('/jobs', getAllJobs);
router.get('/applications', getAllApplications);

export default router;
