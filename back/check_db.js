require('dotenv').config();
const { getAll } = require('./config/db.js');

async function check() {
  const students = await getAll('SELECT * FROM students WHERE code = \'002A7660\'');
  console.log('Student:', students);
  const records = await getAll('SELECT * FROM attendance ORDER BY id DESC LIMIT 5');
  console.log('Recent Attendance:', records);
  process.exit(0);
}

check().catch(console.error);
