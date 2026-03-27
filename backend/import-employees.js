const XLSX = require('xlsx');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcryptjs');

async function importEmployees() {
  try {
    const workbook = XLSX.readFile(path.join(__dirname, 'employee_directory.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`Starting import of ${data.length} employees...`);
    
    const defaultPassword = await bcrypt.hash('Password@123', 10);
    
    for (const row of data) {
      // Map roles to lowercase to match DB enum
      let role = (row['Role'] || 'employee').toLowerCase();
      if (role === 'employee') role = 'employee';
      if (role === 'manager') role = 'manager';
      if (role === 'admin') role = 'admin';
      
      const email = row['Email'];
      const name = row['Full Name'];
      const doj = row['Join Date'] ? new Date(row['Join Date']) : new Date();

      try {
        await db.query(
          `INSERT INTO users (name, email, password_hash, role, doj) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (email) DO UPDATE 
           SET name = EXCLUDED.name, role = EXCLUDED.role, doj = EXCLUDED.doj`,
          [name, email, defaultPassword, role, doj]
        );
        console.log(`Imported: ${email} (${role})`);
      } catch (err) {
        console.error(`Failed to import ${email}:`, err.message);
      }
    }
    
    console.log('Import completed!');
  } catch (err) {
    console.error('Fatal import error:', err.message);
  } finally {
    process.exit();
  }
}

importEmployees();
