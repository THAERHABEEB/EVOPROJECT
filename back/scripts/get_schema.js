const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_q1BraQwg7ust@ep-dry-wildflower-ankkdke1-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function getCols() {
  for (let t of ['assignment', 'grade']) {
    let res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '" + t + "'");
    console.log(`Table: ${t}`);
    console.log(res.rows);
  }
}
getCols().catch(console.error).finally(()=>pool.end());
