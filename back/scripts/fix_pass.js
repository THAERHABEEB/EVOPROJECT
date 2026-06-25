require('dotenv').config({ path: '../.env' });
const { runQuery } = require('../config/db.js');
async function fix() {
  await runQuery(`UPDATE "USER" SET password = '123456' WHERE role = 'Student Affair'`);
  console.log('Password fixed');
  process.exit(0);
}
fix();
