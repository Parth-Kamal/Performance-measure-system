const db = require('./db');

async function checkUsers() {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users');
    console.log('Users in DB:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error checking users:', err.message);
  } finally {
    process.exit();
  }
}

checkUsers();
