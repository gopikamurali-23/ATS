const express = require('express');
const router = express.Router();
const store = require('../db/store');

// GET /api/analytics/dashboard
router.get('/dashboard', (req, res) => {
  const stats = store.getDashboardStats();
  return res.json(stats);
});

module.exports = router;
