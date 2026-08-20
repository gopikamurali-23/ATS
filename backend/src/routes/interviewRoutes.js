import express from 'express';
import {
  scheduleInterview,
  getCompanyInterviews,
  getCandidateInterviews,
  updateInterviewStatus,
  generateMockQuestions,
  submitMockAnswer,
  evaluateMockInterview,
  getCompanySpecificPrep,
  getAssignedPrepTopics,
  getTopicTheory,
  getTopicMCQs,
  submitTopicMCQs,
  getTopicWritten,
  submitTopicWritten,
  getTopicMocks
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

// Assigned Preparation Portal
router.get('/prep/topics', authenticate, authorize('ROLE_CANDIDATE'), getAssignedPrepTopics);
router.get('/prep/topic/:topicId/theory', authenticate, authorize('ROLE_CANDIDATE'), getTopicTheory);
router.get('/prep/topic/:topicId/mcqs', authenticate, authorize('ROLE_CANDIDATE'), getTopicMCQs);
router.post('/prep/topic/:topicId/mcq-submit', authenticate, authorize('ROLE_CANDIDATE'), submitTopicMCQs);
router.get('/prep/topic/:topicId/written', authenticate, authorize('ROLE_CANDIDATE'), getTopicWritten);
router.post('/prep/topic/:topicId/written-submit', authenticate, authorize('ROLE_CANDIDATE'), submitTopicWritten);
router.get('/prep/topic/:topicId/mocks', authenticate, authorize('ROLE_CANDIDATE'), getTopicMocks);

export default router;
