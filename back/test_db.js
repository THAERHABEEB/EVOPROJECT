const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => 
  c.query('SELECT id, name, role, password FROM "USER" LIMIT 1')
   .then(r => { console.log(r.rows); process.exit(); })
).catch(console.error);
