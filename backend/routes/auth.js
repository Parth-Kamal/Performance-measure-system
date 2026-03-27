const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, is_player_coach: user.is_player_coach } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register (for initial setup/admin use)
router.post('/register', async (req, res) => {
  const { name, email, password, role, manager_id, doj, is_player_coach } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, manager_id, doj, is_player_coach) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'employee', manager_id || null, doj || new Date(), is_player_coach || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Setup account (for Excel-imported users)
router.post('/setup', async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'UPDATE users SET name = $1, password_hash = $2 WHERE email = $3 RETURNING id, name, email, role',
      [name, hashedPassword, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Email not found in employee directory' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
