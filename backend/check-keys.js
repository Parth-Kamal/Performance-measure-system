const XLSX = require('xlsx');
const path = require('path');

async function checkKeys() {
  try {
    const workbook = XLSX.readFile(path.join(__dirname, 'employee_directory.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    if (data.length > 0) {
      console.log('Available keys in Excel row:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data found in Excel.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkKeys();
