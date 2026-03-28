const db = require('../db');

async function migrate() {
  try {
    console.log('Migrating goals table...');
    await db.query(`
      ALTER TABLE goals 
      ADD COLUMN IF NOT EXISTS assigner_id UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES goals(id)
    `);
    console.log('Migration successful! ✅');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
