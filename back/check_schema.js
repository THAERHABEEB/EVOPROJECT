require('dotenv').config();
const { getAll } = require('./config/db.js');

async function check() {
  const res = await getAll(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'student_request'
  `);
  console.log('student_request schema:', res);
  
  const roles = await getAll('SELECT DISTINCT role FROM "USER"');
  console.log('Roles:', roles);
  process.exit(0);
}
check().catch(console.error);
