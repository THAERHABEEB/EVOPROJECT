const bcrypt = require('bcryptjs');
const { runQuery, getOne } = require('../config/db.js');
require('dotenv').config();

async function insertData() {
  const defaultPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  console.log('--- Starting Data Insertion ---');

  try {
    // 1. Insert Users
    const users = [
      { name: 'Ahmed Mohamed', role: 'student' },
      { name: 'Sara Ali', role: 'student' },
      { name: 'Dr. Khaled Omar', role: 'doctor' },
      { name: 'Dr. Mona Hassan', role: 'doctor' },
      { name: 'Admin User', role: 'admin' }
    ];

    const userIds = [];
    for (const u of users) {
      console.log(`Inserting user: ${u.name}`);
      const result = await runQuery(
        'INSERT INTO "USER" (name, password, role, created_at, updated_in) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
        [u.name, hashedPassword, u.role]
      );
      userIds.push(result.rows[0].id);
    }
    console.log('✅ Users inserted successfully');

    // 2. Insert Students
    const students = [
      { code: 'STU001', name: 'Ahmed Mohamed', userId: userIds[0], phone: '01012345678', address: 'Cairo', dept: 'Computer Science', photo: 'photos/ahmed.jpg', dob: '2000-05-15', email: 'ahmed@student.edu', age: 24, semester: 'Semester 1', year: 1 },
      { code: 'STU002', name: 'Sara Ali', userId: userIds[1], phone: '01098765432', address: 'Alexandria', dept: 'Computer Science', photo: 'photos/sara.jpg', dob: '2001-08-20', email: 'sara@student.edu', age: 23, semester: 'Semester 1', year: 1 }
    ];

    for (const s of students) {
      console.log(`Inserting student: ${s.name}`);
      await runQuery(
        'INSERT INTO students (code, name, user_id, phone, address, department, photo, date_of_birth, age, email, status, current_semester, year_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [s.code, s.name, s.userId, s.phone, s.address, s.dept, s.photo, s.dob, s.age, s.email, 'active', s.semester, s.year]
      );
    }
    console.log('✅ Students inserted successfully');

    // 3. Insert Doctors
    const doctors = [
      { name: 'Dr. Khaled Omar', userId: userIds[2], dept: 'Computer Science', loc: 'Building A - Room 101', qual: 'PhD Computer Science', photo: 'photos/khaled.jpg', email: 'khaled@doctor.edu' },
      { name: 'Dr. Mona Hassan', userId: userIds[3], dept: 'Computer Science', loc: 'Building B - Room 205', qual: 'PhD Software Engineering', photo: 'photos/mona.jpg', email: 'mona@doctor.edu' }
    ];

    for (const d of doctors) {
      console.log(`Inserting doctor: ${d.name}`);
      await runQuery(
        'INSERT INTO doctor (name, user_id, department, officelocation, qualification, photo, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [d.name, d.userId, d.dept, d.loc, d.qual, d.photo, d.email]
      );
    }
    console.log('✅ Doctors inserted successfully');

    // 4. Insert Admin
    console.log('Inserting admin: Admin User');
    await runQuery(
      'INSERT INTO admin (user_id, code, created_date, permission) VALUES ($1, $2, NOW(), $3)',
      [userIds[4], 'ADM001', 'all']
    );
    console.log('✅ Admin inserted successfully');

    console.log('\n--- DATA INSERTION COMPLETE ---');
    console.log('Default password for all users: ' + defaultPassword);
    process.exit(0);
  } catch (err) {
    console.error('❌ Data insertion failed:', err);
    process.exit(1);
  }
}

insertData();
