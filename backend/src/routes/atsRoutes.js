import express from 'express';
import multer from 'multer';
import { parseResume } from '../controllers/atsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/parse', upload.single('resumeFile'), parseResume);

export default router;
