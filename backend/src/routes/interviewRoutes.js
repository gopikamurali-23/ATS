import express from 'express';
import {
  scheduleInterview,
  getCompanyInterviews,
  getCandidateInterviews,
  updateInterviewStatus,
  generateMockQuestions,
  submitMockAnswer,
  evaluateMockInterview,
  getCompanySpecificPrep
} from '../controllers/interviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Scheduling
router.post('/schedule', authenticate, authorize('ROLE_COMPANY'), scheduleInterview);
router.get('/company', authenticate, authorize('ROLE_COMPANY'), getCompanyInterviews);
router.get('/candidate', authenticate, authorize('ROLE_CANDIDATE'), getCandidateInterviews);
router.put('/:id/action', authenticate, authorize('ROLE_CANDIDATE'), updateInterviewStatus);

// AI Interview Prep
router.post('/prep/generate-questions', authenticate, authorize('ROLE_CANDIDATE'), generateMockQuestions);
router.post('/prep/mock-submit', authenticate, authorize('ROLE_CANDIDATE'), submitMockAnswer);
router.post('/prep/evaluate', authenticate, authorize('ROLE_CANDIDATE'), evaluateMockInterview);
router.get('/prep/company-specific/:companyName', authenticate, authorize('ROLE_CANDIDATE'), getCompanySpecificPrep);

export default router;
