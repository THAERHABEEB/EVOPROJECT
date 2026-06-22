const { runQuery } = require('./config/db.js');

async function run() {
  try {
    const tables = ['students', 'grade', 'enrollments', 'course'];
    for (const table of tables) {
      const res = await runQuery(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
      console.log(`--- ${table} ---`);
      console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }
    process.exit(0);
  } catch(err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
