const db = require('./db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const name = 'Admin User';
  const email = 'admin@pms.com';
  const password = 'Password@123';
  const role = 'admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET role = $4',
      [name, email, hashedPassword, role]
    );
    console.log(`Admin user created/updated: ${email} / ${password}`);
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    process.exit();
  }
}

createAdmin();
