const { pool } = require('../config/db.js');
require('dotenv').config();

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'USER'
    `);
    console.log('Columns in "USER" table:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    
    const res2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
    `);
    console.log('\nColumns in "students" table:');
    res2.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

    const res3 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctor'
    `);
    console.log('\nColumns in "doctor" table:');
    res3.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

    const res4 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin'
    `);
    console.log('\nColumns in "admin" table:');
    res4.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSchema();
