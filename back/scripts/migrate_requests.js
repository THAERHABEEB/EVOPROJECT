require('dotenv').config({ path: '../.env' });
const { runQuery, getOne } = require('../config/db.js');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    console.log('Adding columns to student_request table...');
    await runQuery(`ALTER TABLE student_request ADD COLUMN IF NOT EXISTS notes TEXT;`);
    await runQuery(`ALTER TABLE student_request ADD COLUMN IF NOT EXISTS img TEXT;`);
    
    console.log('Checking for Student Affair user...');
    let affairUser = await getOne('SELECT * FROM "USER" WHERE Role = $1', ['Student Affair']);
    if (!affairUser) {
      console.log('Creating Student Affair user...');
      const maxIdRes = await getOne('SELECT MAX(id) as max FROM "USER"');
      const nextId = (maxIdRes.max || 0) + 1;
      const hash = await bcrypt.hash('123456', 10);
      await runQuery('INSERT INTO "USER" (id, name, password, role) VALUES ($1, $2, $3, $4)', 
        [nextId, 'Affairs Dept', hash, 'Student Affair']);
      console.log('Student Affair user created with ID:', nextId);
    } else {
      console.log('Student Affair user already exists.');
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
