import express from 'express';
import {
  generateSummary,
  rewriteExperience,
  generateSkills,
  improveGrammar,
  suggestSkills,
  suggestKeywords,
  saveResume,
  listVersions,
  getVersion,
  exportResume
} from '../controllers/resumeBuilderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/builder/generate-summary', authenticate, authorize('ROLE_CANDIDATE'), generateSummary);
router.post('/builder/rewrite-experience', authenticate, authorize('ROLE_CANDIDATE'), rewriteExperience);
router.post('/builder/generate-skills', authenticate, authorize('ROLE_CANDIDATE'), generateSkills);
router.post('/builder/improve-grammar', authenticate, authorize('ROLE_CANDIDATE'), improveGrammar);
router.post('/builder/suggest-skills', authenticate, authorize('ROLE_CANDIDATE'), suggestSkills);
router.post('/builder/suggest-keywords', authenticate, authorize('ROLE_CANDIDATE'), suggestKeywords);
router.post('/builder/save', authenticate, authorize('ROLE_CANDIDATE'), saveResume);
router.get('/builder/versions', authenticate, authorize('ROLE_CANDIDATE'), listVersions);
router.get('/builder/:id', authenticate, authorize('ROLE_CANDIDATE'), getVersion);
router.get('/builder/:id/export/:format', authenticate, authorize('ROLE_CANDIDATE'), exportResume);

export default router;
