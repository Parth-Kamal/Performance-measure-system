const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { startReviewCycle } = require('../services/reviewService');

// Admin: Start a new cycle
router.post('/start', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { type, period_label, start_date, close_date, finalize_date } = req.body;
  try {
    const cycle = await startReviewCycle(type, period_label, start_date, close_date, finalize_date);
    res.status(201).json(cycle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current active cycles
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM review_cycles WHERE status != $1', ['finalized']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
