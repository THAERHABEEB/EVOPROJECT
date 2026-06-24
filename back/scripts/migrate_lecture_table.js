const { runQuery } = require('../config/db.js');

async function migrate() {
  try {
    console.log('Adding schedule columns to Lecture table...');
    
    // Add columns if they don't exist
    await runQuery(`
      ALTER TABLE Lecture 
      ADD COLUMN IF NOT EXISTS day_of_week INT,
      ADD COLUMN IF NOT EXISTS start_time TIME,
      ADD COLUMN IF NOT EXISTS end_time TIME,
      ADD COLUMN IF NOT EXISTS section_num INT;
    `);

    console.log('Successfully added day_of_week, start_time, end_time, section_num to Lecture table.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit();
}

migrate();
