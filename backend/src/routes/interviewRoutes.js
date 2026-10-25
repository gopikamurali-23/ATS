import express from 'express';
import {
  getInterviews,
  scheduleInterview,
  updateInterview
} from '../controllers/interviewController.js';

const router = express.Router();

router.get('/', getInterviews);
router.post('/schedule', scheduleInterview);
router.put('/:id', updateInterview);

export default router;
