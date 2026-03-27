const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    const client = await pool.connect();
    console.log('Connected to DB, setting up admin user...');

    const email = 'yvonne.mitchell@hr.com';
    const password = '12345678';
    const role = 'admin';
    const name = 'Yvonne Mitchell';
    
    const hashed = await bcrypt.hash(password, 10);

    // Check if user exists
    const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId;

    if (check.rows.length > 0) {
      console.log('User exists, updating password and role to admin...');
      const updateResult = await client.query(
        'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3 RETURNING id',
        [hashed, role, email]
      );
      userId = updateResult.rows[0].id;
    } else {
      console.log('User does not exist, creating new admin account...');
      const insertResult = await client.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, hashed, role]
      );
      userId = insertResult.rows[0].id;
    }

    // Also ensure they have an hr_detail entry if not exists
    const hrCheck = await client.query('SELECT id FROM hr_detail WHERE user_id = $1', [userId]);
    if (hrCheck.rows.length === 0) {
      await client.query('INSERT INTO hr_detail (user_id, region, specialization) VALUES ($1, $2, $3)', [userId, 'Global', 'HR Administration']);
      console.log('Created HR Detail record for Admin.');
    }

    console.log('Successfully set up admin: yvonne.mitchell@hr.com');
    client.release();
  } catch (err) {
    console.error('Error setting up admin:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
