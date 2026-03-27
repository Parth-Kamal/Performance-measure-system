const XLSX = require('xlsx');
const path = require('path');

async function inspectExcel() {
  try {
    const workbook = XLSX.readFile(path.join(__dirname, 'employee_directory.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    console.log('Employee Data (First 10 rows):');
    console.table(data.slice(0, 10));
    console.log(`Total rows: ${data.length}`);
  } catch (err) {
    console.error('Error reading Excel:', err.message);
  }
}

inspectExcel();
