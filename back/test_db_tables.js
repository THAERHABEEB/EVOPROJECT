const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => 
  c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
   .then(r => { console.log(r.rows); process.exit(); })
).catch(console.error);
