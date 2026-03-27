const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding name column to detail tables...');
    await client.query(`
      ALTER TABLE employee_detail ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE manager_detail ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE hr_detail ADD COLUMN IF NOT EXISTS name TEXT;
    `);
    console.log('Done! Name column added to employee_detail, manager_detail, hr_detail.');
    
    // Show current state of tables
    const emp = await client.query('SELECT * FROM employee_detail LIMIT 5');
    const mgr = await client.query('SELECT * FROM manager_detail LIMIT 5');
    const hr  = await client.query('SELECT * FROM hr_detail LIMIT 5');
    
    console.log('\n--- employee_detail ---');
    console.table(emp.rows);
    console.log('\n--- manager_detail ---');
    console.table(mgr.rows);
    console.log('\n--- hr_detail ---');
    console.table(hr.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
