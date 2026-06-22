const bcrypt = require('bcryptjs');
const { runQuery, getOne } = require('../config/db.js');
require('dotenv').config();

async function test() {
  const username = 'TestUser' + Date.now();
  const password = 'password123';
  const role = 'student';

  console.log('--- Testing Password Hashing & Login ---');

  try {
    // 1. Create a user with a hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Creating test user:', username);
    await runQuery(
      'INSERT INTO "USER" (name, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );
    console.log('✅ User created with hashed password');

    // 2. Fetch user and verify hash
    const user = await getOne('SELECT * FROM "USER" WHERE name = $1', [username]);
    console.log('Stored password hash:', user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match test:', isMatch ? '✅ SUCCESS' : '❌ FAILED');

    const isWrongMatch = await bcrypt.compare('wrongpassword', user.password);
    console.log('Wrong password check:', !isWrongMatch ? '✅ SUCCESS (Caught)' : '❌ FAILED (Accepted)');

    // 3. Cleanup
    await runQuery('DELETE FROM "USER" WHERE name = $1', [username]);
    console.log('✅ Test user cleaned up');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

test();
