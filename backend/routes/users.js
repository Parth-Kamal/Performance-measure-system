const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');

const upload = multer({ dest: 'uploads/' });

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, manager_id, doj, is_player_coach FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reportees (for managers)
router.get('/reportees', authenticateToken, authorizeRoles('manager', 'admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, doj FROM users WHERE manager_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload users via Excel
router.post('/upload', authenticateToken, authorizeRoles('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;

      for (const row of data) {
        const name = row.Name || row.name;
        const email = row.Email || row.email;
        let role = (row.Role || row.role || 'employee').toLowerCase();
        const password = row.Password || row.password || '12345678';
        const department = row.Department || row.department;

        if (!name || !email) continue;
        const hashed = await bcrypt.hash(password.toString(), 10);
        
        const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        let userId;

        if (check.rows.length > 0) {
          userId = check.rows[0].id;
          await client.query(
            'UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE id = $4',
            [name, hashed, role, userId]
          );
        } else {
          const result = await client.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashed, role]
          );
          userId = result.rows[0].id;
        }

        if (role === 'employee') {
          await client.query('DELETE FROM employee_detail WHERE user_id = $1', [userId]);
          await client.query('INSERT INTO employee_detail (user_id, name, role) VALUES ($1, $2, $3)', [userId, name, 'employee']);
        } else if (role === 'manager') {
          await client.query('DELETE FROM manager_detail WHERE user_id = $1', [userId]);
          await client.query('INSERT INTO manager_detail (user_id, name, role) VALUES ($1, $2, $3)', [userId, name, 'manager']);
        } else if (role === 'admin') {
          await client.query('DELETE FROM hr_detail WHERE user_id = $1', [userId]);
          await client.query('INSERT INTO hr_detail (user_id, name, role) VALUES ($1, $2, $3)', [userId, name, 'admin']);
        }
        inserted++;
      }
      await client.query('COMMIT');
      res.json({ message: `Successfully uploaded ${inserted} users.` });
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

// Manual Add User
router.post('/add', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const hashed = await bcrypt.hash(password, 10);
      
      const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      let userId;

      if (check.rows.length > 0) {
        // User exists, update them
        userId = check.rows[0].id;
        await client.query(
          'UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE id = $4',
          [name, hashed, role, userId]
        );
      } else {
        // Insert new user
        const result = await client.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [name, email, hashed, role]
        );
        userId = result.rows[0].id;
      }

      // Upsert detail tables
      if (role === 'employee') {
        await client.query('DELETE FROM employee_detail WHERE user_id = $1', [userId]);
        await client.query('INSERT INTO employee_detail (user_id, name, role) VALUES ($1, $2, $3)', [userId, name, 'employee']);
      } else if (role === 'manager') {
        await client.query('DELETE FROM manager_detail WHERE user_id = $1', [userId]);
        await client.query('INSERT INTO manager_detail (user_id, name, role) VALUES ($1, $2, $3)', [userId, name, 'manager']);
      } else if (role === 'admin') {
        await client.query('DELETE FROM hr_detail WHERE user_id = $1', [userId]);
        await client.query('INSERT INTO hr_detail (user_id, name, role) VALUES ($1, $2, $3)', [userId, name, 'admin']);
      }
      
      await client.query('COMMIT');
      res.json({ message: 'User added successfully', id: userId });
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

// Get all managers (for admin team assignment)
router.get('/managers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email FROM users WHERE role = \'manager\' ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unassigned employees (for admin team assignment)
router.get('/unassigned-employees', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email FROM users WHERE role = \'employee\' AND manager_id IS NULL ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all employees (for admin direct assignment)
router.get('/all-employees', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email FROM users WHERE LOWER(role::text) = \'employee\' ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign team members to a manager (admin only)
router.post('/assign-team', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { managerId, employeeIds } = req.body;
  if (!managerId || !Array.isArray(employeeIds)) {
    return res.status(400).json({ message: 'Manager ID and Employee IDs array required' });
  }

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const mgrResult = await client.query('SELECT name FROM users WHERE id = $1', [managerId]);
      if (mgrResult.rows.length === 0) return res.status(404).json({ message: 'Manager not found' });
      const managerName = mgrResult.rows[0].name;

      for (const empId of employeeIds) {
        await client.query('UPDATE users SET manager_id = $1 WHERE id = $2', [managerId, empId]);
        
        // Create notification for employee
        await client.query(
          'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
          [empId, 'team_assignment', 'Welcome to the Team!', `You have been assigned to ${managerName}'s team.`, '/team']
        );
      }
      await client.query('COMMIT');
      res.json({ message: `Successfully assigned ${employeeIds.length} employees to manager` });
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

// Get My Team (Manager and Teammates)
router.get('/team', authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query('SELECT manager_id FROM users WHERE id = $1', [req.user.id]);
    const managerId = userResult.rows[0].manager_id;
    
    if (!managerId) {
      return res.json({ manager: null, teammates: [] });
    }

    const managerResult = await db.query('SELECT name, email, role FROM users WHERE id = $1', [managerId]);
    const teammatesResult = await db.query(
      'SELECT id, name, email, role FROM users WHERE manager_id = $1 AND id != $2',
      [managerId, req.user.id]
    );

    res.json({
      manager: managerResult.rows[0],
      teammates: teammatesResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
