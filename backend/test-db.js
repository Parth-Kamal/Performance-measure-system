const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database');
    
    // Check if users table exists
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    console.log('Users table exists:', tableRes.rows.length > 0);

    if (tableRes.rows.length > 0) {
      const columnRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      console.log('Columns:', columnRes.rows);
    }

    client.release();
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
