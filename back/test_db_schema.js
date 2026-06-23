const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(async () => {
  const userSchema = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='USER'");
  const studentSchema = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='students'");
  console.log("USER columns:", userSchema.rows.map(r => r.column_name));
  console.log("students columns:", studentSchema.rows.map(r => r.column_name));
  process.exit();
}).catch(console.error);
