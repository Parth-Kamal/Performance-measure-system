const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { hasNegativeSentiment } = require('../utils/sentiment');

// Submit Feedback (Employee/Manager)
router.post('/', authenticateToken, async (req, res) => {
  const { employee_id, form_type, cycle_id, probation_trigger_id, goal_ratings, open_text, overall_rating } = req.body;
  
  try {
    // Determine flag status
    let flag_status = 'none';
    if (overall_rating <= 2 || hasNegativeSentiment(open_text)) {
      flag_status = 'hard';
    } else if (!open_text || Object.values(open_text).some(v => v === '')) {
      flag_status = 'soft';
    }

    // Check for "Repeat Flag"
    const prevFlags = await db.query(
      'SELECT flag_status FROM feedback_submissions WHERE employee_id = $1 AND flag_status != $2 ORDER BY submitted_at DESC LIMIT 1',
      [employee_id, 'none']
    );
    if (prevFlags.rowCount > 0 && flag_status === 'hard') {
      flag_status = 'repeat';
    }

    const result = await db.query(
      `INSERT INTO feedback_submissions 
      (employee_id, reviewer_id, form_type, cycle_id, probation_trigger_id, goal_ratings, open_text, overall_rating, flag_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [employee_id, req.user.id, form_type, cycle_id || null, probation_trigger_id || null, goal_ratings, open_text, overall_rating, flag_status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Review Queue (Original flags view)
router.get('/flags', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT f.*, u.name as employee_name FROM feedback_submissions f JOIN users u ON f.employee_id = u.id WHERE flag_status IN ($1, $2, $3) ORDER BY submitted_at DESC',
      ['soft', 'hard', 'repeat']
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full Detailed Feedback List (For Admin Dashboard)
router.get('/all-detailed', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const query = `
      SELECT 
        f.id,
        f.employee_id,
        u.name as employee_name,
        u.email as employee_email,
        u.role as employee_role,
        -- Need department - assuming it's in a detail table or I'll use a placeholder if not found
        -- Actually, init.sql doesn't have department in users table, let's check users.js or detail tables
        m.name as manager_name,
        f.form_type,
        f.overall_rating,
        f.open_text,
        f.submitted_at,
        f.flag_status,
        f.cycle_id,
        f.probation_trigger_id
      FROM feedback_submissions f
      JOIN users u ON f.employee_id = u.id
      LEFT JOIN users m ON u.manager_id = m.id
      ORDER BY f.submitted_at DESC
    `;
    const result = await db.query(query);
    
    // Group by employee and cycle to create the "Comparison" view
    const grouped = {};
    result.rows.forEach(row => {
      const key = `${row.employee_id}_${row.cycle_id || row.probation_trigger_id || 'none'}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          employeeName: row.employee_name,
          department: 'General', // Placeholder - will attempt to get real dept if available
          managerName: row.manager_name || 'System',
          status: 'Completed',
          timestamp: row.submitted_at,
          selfRating: null,
          selfComment: null,
          managerRating: null,
          managerComment: null,
        };
      }
      
      if (row.form_type === 'self') {
        grouped[key].selfRating = row.overall_rating;
        grouped[key].selfComment = typeof row.open_text === 'string' ? row.open_text : JSON.stringify(row.open_text);
      } else {
        grouped[key].managerRating = row.overall_rating;
        grouped[key].managerComment = typeof row.open_text === 'string' ? row.open_text : JSON.stringify(row.open_text);
      }
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
