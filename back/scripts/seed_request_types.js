require('dotenv').config({ path: '../.env' });
const { runQuery } = require('../config/db.js');

async function seed() {
  const types = [
    ['enrollment', 'Enrollment Certificate'],
    ['metro', 'Metro Subscription'],
    ['transcript', 'Transcript'],
    ['excuse', 'Semester Excuse']
  ];
  
  for (const [key, title] of types) {
    try {
      await runQuery('INSERT INTO request_type (type_key, title) VALUES (?, ?)', [key, title]);
      console.log(`Inserted ${key}`);
    } catch (e) {
      console.log(`Skipped ${key} (might exist): ${e.message}`);
    }
  }
  process.exit(0);
}
seed();
