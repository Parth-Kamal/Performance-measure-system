const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create a goal
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, weightage, deadline, flag_status, cycle_id, employee_id } = req.body;
  const isManagerOrAdmin = req.user.role === 'manager' || req.user.role === 'admin';
  
  // If employee_id is provided, check if user is authorized to assign to them
  const targetEmployeeId = (isManagerOrAdmin && employee_id) ? employee_id : req.user.id;
  const initialStatus = (isManagerOrAdmin && employee_id) ? 'active' : 'draft';

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'INSERT INTO goals (employee_id, title, description, weightage, deadline, flag_status, cycle_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [targetEmployeeId, title, description, weightage || 0, deadline || null, flag_status || 'none', cycle_id || null, initialStatus]
      );
      
      const goal = result.rows[0];

      // If assigned by manager, notify the employee
      if (isManagerOrAdmin && employee_id && employee_id !== req.user.id) {
        const mgrRes = await client.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const mgrName = mgrRes.rows[0]?.name || 'Your Manager';
        
        await client.query(
          'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
          [employee_id, 'goal_assigned', 'New Goal Assigned 🎯', `${mgrName} has assigned you a new goal: "${title}"`, '/goals']
        );
      }

      await client.query('COMMIT');
      res.status(201).json(goal);
    } catch (err) {
      if (client) await client.query('ROLLBACK');
      console.error('Error in POST /api/goals:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit goal for approval
router.put('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE goals SET status = $1, submitted_at = NOW() WHERE id = $2 AND employee_id = $3 AND status = $4 RETURNING *',
        ['pending approval', req.params.id, req.user.id, 'draft']
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Goal not found or not in draft' });
      }
      
      const goal = result.rows[0];
      
      // Notify manager
      const userRes = await client.query('SELECT name, manager_id FROM users WHERE id = $1', [req.user.id]);
      const { name, manager_id } = userRes.rows[0];
      
      if (manager_id) {
        await client.query(
          'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
          [manager_id, 'goal_submission', 'Goal Approval Request', `${name} has submitted a goal: "${goal.title}"`, '/approvals']
        );
      }

      await client.query('COMMIT');
      res.json(goal);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve goal (Manager/Admin)
router.put('/:id/approve', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  const { weightage } = req.body;
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE goals SET status = $1, approved_at = NOW(), approved_by = $2, weightage = $3 WHERE id = $4 AND status = $5 RETURNING *',
        ['active', req.user.id, weightage, req.params.id, 'pending approval']
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Goal not found or not pending approval' });
      }
      
      const goal = result.rows[0];

      // Notify employee
      await client.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
        [goal.employee_id, 'goal_approved', 'Goal Approved! ✅', `Your goal "${goal.title}" has been approved with ${weightage}% weightage.`, '/goals']
      );

      await client.query('COMMIT');
      res.json(goal);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject goal (Manager/Admin)
router.put('/:id/reject', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  const { reason } = req.body;
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE goals SET status = $1, rejection_reason = $2 WHERE id = $3 AND status = $4 RETURNING *',
        ['draft', reason, req.params.id, 'pending approval']
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Goal not found or not pending approval' });
      }

      const goal = result.rows[0];

      // Notify employee
      await client.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
        [goal.employee_id, 'goal_rejected', 'Goal Needs Revision ❌', `Your goal "${goal.title}" was rejected. Reason: ${reason}`, '/goals']
      );

      await client.query('COMMIT');
      res.json(goal);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flag a goal (Manager/Admin)
router.patch('/:id/flag', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  const { flag_status } = req.body;
  try {
    const result = await db.query(
      'UPDATE goals SET flag_status = $1 WHERE id = $2 RETURNING *',
      [flag_status || 'none', req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Goal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update goal completion (Employee)
router.patch('/:id/completion', authenticateToken, async (req, res) => {
  const { completion_pct } = req.body;
  try {
    const result = await db.query(
      'UPDATE goals SET completion_pct = $1 WHERE id = $2 AND employee_id = $3 RETURNING *',
      [completion_pct, req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Goal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM goals WHERE employee_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reportees' pending goals (Manager/Admin)
router.get('/manager/pending', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT g.*, u.name as employee_name 
      FROM goals g 
      JOIN users u ON g.employee_id = u.id 
      WHERE u.manager_id = $1 AND g.status IN ('pending approval', 'pending completion approval')
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request goal completion (Employee)
router.put('/:id/complete-request', authenticateToken, async (req, res) => {
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE goals SET status = $1 WHERE id = $2 AND employee_id = $3 AND status = $4 RETURNING *',
        ['pending completion approval', req.params.id, req.user.id, 'active']
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Goal not found or not currently active' });
      }

      const goal = result.rows[0];

      // Notify manager
      const userRes = await client.query('SELECT name, manager_id FROM users WHERE id = $1', [req.user.id]);
      const { name, manager_id } = userRes.rows[0];
      
      if (manager_id) {
        await client.query(
          'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
          [manager_id, 'goal_completion_request', 'Goal Completion Review', `${name} has marked goal "${goal.title}" as completed. Please review.`, '/approvals']
        );
      }

      await client.query('COMMIT');
      res.json(goal);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in /complete-request:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve goal completion (Manager/Admin)
router.put('/:id/complete-approve', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE goals SET status = $1, completion_pct = 100 WHERE id = $2 AND status = $3 RETURNING *',
        ['completed', req.params.id, 'pending completion approval']
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Goal not found or not pending completion' });
      }

      const goal = result.rows[0];

      // Notify employee
      await client.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
        [goal.employee_id, 'goal_completed', 'Goal Completed! 🎉', `Your completion request for "${goal.title}" has been approved.`, '/goals']
      );

      await client.query('COMMIT');
      res.json(goal);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in /complete-approve:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject goal completion (Manager/Admin)
router.put('/:id/complete-reject', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  const { reason } = req.body;
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE goals SET status = $1, rejection_reason = $2 WHERE id = $3 AND status = $4 RETURNING *',
        ['active', reason, req.params.id, 'pending completion approval']
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Goal not found or not pending completion' });
      }

      const goal = result.rows[0];

      // Notify employee
      await client.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
        [goal.employee_id, 'goal_completion_rejected', 'Completion Request Returned 🔄', `Your goal completion request for "${goal.title}" was returned. Reason: ${reason}`, '/goals']
      );

      await client.query('COMMIT');
      res.json(goal);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in /complete-reject:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
