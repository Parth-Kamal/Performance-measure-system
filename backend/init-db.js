const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    const client = await pool.connect();
    console.log('Connected to database. Executing init.sql...');
    
    // Split SQL by semicolon and execute each statement
    // Note: This is a simple splitter and might fail on complex SQL with internal semicolons,
    // but init.sql seems simple enough. Actually, better to run the whole block at once.
    await client.query(sql);
    
    console.log('Schema initialized successfully!');
    client.release();
  } catch (err) {
    console.error('Initialization error:', err.message);
  } finally {
    await pool.end();
  }
}

initDb();
