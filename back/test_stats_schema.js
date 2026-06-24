const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(async () => {
  const tables = ['grade', 'attendance', 'assignment', 'quiz_submission', 'enrollments', 'course'];
  for (const t of tables) {
    const s = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${t}'`);
    console.log(`${t} columns:`, s.rows.map(r => r.column_name));
  }
  process.exit();
}).catch(console.error);
