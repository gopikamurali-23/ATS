const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/jobs - List all active jobs
router.get('/', (req, res) => {
  return res.json(store.getActiveJobs());
});

// GET /api/jobs/:id - Get job by ID
router.get('/:id', (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  return res.json(job);
});

// GET /api/jobs/company/:companyName - Get jobs by company
router.get('/company/:companyName', (req, res) => {
  const companyJobs = store.getJobsByCompany(req.params.companyName);
  return res.json(companyJobs);
});

// POST /api/jobs - Create a new job (ROLE_COMPANY or ROLE_ADMIN)
router.post('/', authenticateToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), (req, res) => {
  const jobData = req.body;
  if (!jobData.title || !jobData.description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  // If user is company, set company name from user if missing
  if (req.user && req.user.role === 'ROLE_COMPANY' && req.user.companyName) {
    jobData.companyName = jobData.companyName || req.user.companyName;
  }
  const createdJob = store.createJob(jobData);
  return res.json(createdJob);
});

// PUT /api/jobs/:id - Update an existing job (ROLE_COMPANY or ROLE_ADMIN)
router.put('/:id', authenticateToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), (req, res) => {
  const updated = store.updateJob(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Job not found' });
  }
  return res.json(updated);
});

// DELETE /api/jobs/:id - Delete a job (ROLE_COMPANY or ROLE_ADMIN)
router.delete('/:id', authenticateToken, requireRole('ROLE_COMPANY', 'ROLE_ADMIN'), (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  store.deleteJob(req.params.id);
  return res.status(204).send();
});

module.exports = router;
