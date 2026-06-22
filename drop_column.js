const { runQuery } = require('./back/config/db.js');

async function dropColumn() {
  try {
    console.log('Dropping column grade_id from control table...');
    await runQuery('ALTER TABLE "control" DROP COLUMN IF EXISTS grade_id');
    console.log('✅ Column dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping column:', error);
    process.exit(1);
  }
}

dropColumn();
