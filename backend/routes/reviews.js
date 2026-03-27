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

// Get status of all probation milestones (Admin only)
router.get('/probation-status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const query = `
      SELECT pt.*, u.name as employee_name, u.email as employee_email, u.doj,
             (SELECT COUNT(*) FROM feedback_submissions WHERE probation_trigger_id = pt.id AND form_type = 'self') as self_submitted,
             (SELECT COUNT(*) FROM feedback_submissions WHERE probation_trigger_id = pt.id AND form_type = 'manager') as manager_submitted
      FROM probation_triggers pt
      JOIN users u ON pt.employee_id = u.id
      WHERE pt.waived = FALSE
      ORDER BY pt.scheduled_date ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get compliance report for a specific cycle (Admin only)
router.get('/cycle-compliance/:cycleId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { cycleId } = req.params;
  try {
    const query = `
      SELECT u.id, u.name, u.email, 
             (SELECT COUNT(*) FROM feedback_submissions WHERE cycle_id = $1 AND employee_id = u.id AND form_type = 'self') as self_done,
             (SELECT COUNT(*) FROM feedback_submissions WHERE cycle_id = $1 AND employee_id = u.id AND form_type = 'manager') as manager_done
      FROM users u
      WHERE u.role = 'employee'
      ORDER BY u.name ASC
    `;
    const result = await db.query(query, [cycleId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current active cycles
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM review_cycles WHERE status != $1 ORDER BY created_at DESC', ['finalized']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
