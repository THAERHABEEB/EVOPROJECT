const { runQuery } = require('./config/db.js');

async function migrate_total_grade() {
  console.log('--- Adding total_grade to course table ---');
  try {
    // 1. Add column if it doesn't exist
    await runQuery(`
      ALTER TABLE "course" 
      ADD COLUMN IF NOT EXISTS "total_grade" INTEGER DEFAULT 150;
    `);
    console.log('✅ Column added or already exists with default 150.');

    // 2. Update existing rows where total_grade is null
    const updateResult = await runQuery(`
      UPDATE "course" 
      SET "total_grade" = 150 
      WHERE "total_grade" IS NULL;
    `);
    console.log(`✅ Updated ${updateResult.rowCount} existing courses to have total_grade = 150.`);

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate_total_grade();
