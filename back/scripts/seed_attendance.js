const { runQuery, getAll, getOne } = require('../config/db.js');

const students = [
  { uid: '50914F61', name: 'Ahmed', section: 2 },
  { uid: '535B6906', name: 'Mohamed', section: 4 },
  { uid: '83C56806', name: 'Ali', section: 5 },
  { uid: 'AABBCCDD', name: 'Fatima', section: 1 }
];

const doctors = [
  'Dr. Abdel Salam', 'Dr. Jihad Ziada', 'Dr. Sherif', 'Dr. Allam', 'Supervisor',
  'ENG Abdulaziz', 'ENG Eman Fawzy', 'ENG Ammar', 'ENG Ehab',
  'ENG Omnia', 'ENG Nadia', 'ENG Miram', 'Dr. Obeir'
];

const courses = [
  'IoT', 'Big Data', 'Human Rights', 'Cloud Computing',
  'Algorithms', 'Grad Project', 'Data Mining'
];

const schedule = [
  // Sat(6)
  { course: 'IoT', doc: 'Dr. Abdel Salam', day: 6, start: '11:10:00', end: '12:10:00', section: 1 },
  { course: 'IoT', doc: 'Dr. Abdel Salam', day: 6, start: '11:10:00', end: '12:10:00', section: 4 },
  { course: 'Big Data', doc: 'Dr. Abdel Salam', day: 6, start: '13:20:00', end: '14:20:00', section: 1 },
  { course: 'Big Data', doc: 'Dr. Abdel Salam', day: 6, start: '13:20:00', end: '14:20:00', section: 4 },
  { course: 'Human Rights', doc: 'Dr. Jihad Ziada', day: 6, start: '12:15:00', end: '13:15:00', section: 1 },
  { course: 'Human Rights', doc: 'Dr. Jihad Ziada', day: 6, start: '12:15:00', end: '13:15:00', section: 4 },
  { course: 'Cloud Computing', doc: 'Dr. Sherif', day: 6, start: '15:30:00', end: '17:35:00', section: 1 },
  { course: 'Cloud Computing', doc: 'Dr. Sherif', day: 6, start: '15:30:00', end: '17:35:00', section: 4 },
  { course: 'Algorithms', doc: 'Dr. Allam', day: 6, start: '14:25:00', end: '15:25:00', section: 1 },
  { course: 'Grad Project', doc: 'Supervisor', day: 6, start: '08:00:00', end: '17:35:00', section: 0 },

  // Sun(0)
  { course: 'Algorithms', doc: 'ENG Abdulaziz', day: 0, start: '09:00:00', end: '11:05:00', section: 1 },
  { course: 'Algorithms', doc: 'ENG Abdulaziz', day: 0, start: '09:00:00', end: '11:05:00', section: 2 },
  { course: 'Algorithms', doc: 'ENG Eman Fawzy', day: 0, start: '09:00:00', end: '11:05:00', section: 3 },
  { course: 'Algorithms', doc: 'ENG Eman Fawzy', day: 0, start: '09:00:00', end: '11:05:00', section: 5 },
  { course: 'IoT', doc: 'ENG Ammar', day: 0, start: '11:10:00', end: '12:10:00', section: 1 },
  { course: 'IoT', doc: 'ENG Ammar', day: 0, start: '11:10:00', end: '13:15:00', section: 2 },
  { course: 'IoT', doc: 'ENG Ammar', day: 0, start: '11:10:00', end: '13:15:00', section: 3 },
  { course: 'IoT', doc: 'ENG Ammar', day: 0, start: '12:15:00', end: '14:20:00', section: 4 },
  { course: 'IoT', doc: 'ENG Ammar', day: 0, start: '12:15:00', end: '14:20:00', section: 5 },
  { course: 'Data Mining', doc: 'ENG Ehab', day: 0, start: '13:20:00', end: '15:25:00', section: 1 },
  { course: 'Data Mining', doc: 'ENG Ehab', day: 0, start: '13:20:00', end: '15:25:00', section: 2 },
  { course: 'Data Mining', doc: 'ENG Ehab', day: 0, start: '13:20:00', end: '15:25:00', section: 4 },
  { course: 'Data Mining', doc: 'ENG Ehab', day: 0, start: '13:20:00', end: '15:25:00', section: 5 },

  // Mon(1)
  { course: 'Big Data', doc: 'ENG Omnia', day: 1, start: '11:10:00', end: '13:15:00', section: 2 },
  { course: 'Big Data', doc: 'ENG Omnia', day: 1, start: '11:10:00', end: '13:15:00', section: 4 },
  { course: 'Cloud Computing', doc: 'ENG Nadia', day: 1, start: '13:20:00', end: '15:25:00', section: 1 },
  { course: 'Cloud Computing', doc: 'ENG Nadia', day: 1, start: '13:20:00', end: '15:25:00', section: 2 },
  { course: 'Cloud Computing', doc: 'ENG Nadia', day: 1, start: '13:20:00', end: '15:25:00', section: 3 },
  { course: 'Cloud Computing', doc: 'ENG Miram', day: 1, start: '15:30:00', end: '17:35:00', section: 4 },
  { course: 'Cloud Computing', doc: 'ENG Miram', day: 1, start: '15:30:00', end: '17:35:00', section: 5 },

  // Tue(2)
  { course: 'Data Mining', doc: 'ENG Ehab', day: 2, start: '13:20:00', end: '15:25:00', section: 3 },
  { course: 'Algorithms', doc: 'ENG Eman Fawzy', day: 2, start: '13:20:00', end: '15:25:00', section: 3 },
  { course: 'Algorithms', doc: 'ENG Eman Fawzy', day: 2, start: '13:20:00', end: '15:25:00', section: 4 },
  { course: 'Algorithms', doc: 'ENG Eman Fawzy', day: 2, start: '13:20:00', end: '15:25:00', section: 5 },
  { course: 'IoT', doc: 'ENG Ammar', day: 2, start: '15:30:00', end: '17:35:00', section: 4 },
  { course: 'IoT', doc: 'ENG Ammar', day: 2, start: '15:30:00', end: '17:35:00', section: 5 },

  // Wed(3)
  { course: 'Algorithms', doc: 'ENG Abdulaziz', day: 3, start: '09:00:00', end: '11:05:00', section: 1 },
  { course: 'Data Mining', doc: 'Dr. Obeir', day: 3, start: '11:10:00', end: '12:10:00', section: 1 },
  { course: 'Data Mining', doc: 'Dr. Obeir', day: 3, start: '11:10:00', end: '12:10:00', section: 4 },
  { course: 'Cloud Computing', doc: 'Dr. Sherif', day: 3, start: '13:20:00', end: '15:25:00', section: 1 },
  { course: 'Cloud Computing', doc: 'Dr. Sherif', day: 3, start: '13:20:00', end: '15:25:00', section: 4 },
  { course: 'Cloud Computing', doc: 'ENG Miram', day: 3, start: '15:30:00', end: '17:35:00', section: 4 },
  { course: 'Cloud Computing', doc: 'ENG Miram', day: 3, start: '15:30:00', end: '17:35:00', section: 5 }
];

async function seed() {
  try {
    console.log('Seeding Data...');
    async function getNextId(table) { const r = await getOne(`SELECT MAX(id) as m FROM ${table}`); return (r && r.m) ? parseInt(r.m) + 1 : 1; }
    
    // 1. Doctors
    const docMap = {};
    for (const d of doctors) {
      let doc = await getOne('SELECT * FROM Doctor WHERE NAME = $1', [d]);
      if (!doc) {
        const uid = await getNextId('"USER"');
        await runQuery('INSERT INTO "USER" (ID, NAME, Password, Role) VALUES ($1, $2, $3, $4)', [uid, d, '123456', 'Doctor']);
        const user = await getOne('SELECT * FROM "USER" WHERE NAME = $1', [d]);
        const did = await getNextId('Doctor');
        await runQuery('INSERT INTO Doctor (ID, NAME, USER_ID, Email) VALUES ($1, $2, $3, $4)', [did, d, user.id, d.replace(/\s+/g, '') + '@evo.edu']);
        doc = await getOne('SELECT * FROM Doctor WHERE NAME = $1', [d]);
      }
      docMap[d] = doc.id;
    }
    console.log('Doctors Seeded.');

    // 2. Students
    for (const s of students) {
      let stu = await getOne('SELECT * FROM Students WHERE CODE = $1', [s.uid]);
      if (!stu) {
        const uid = await getNextId('"USER"');
        await runQuery('INSERT INTO "USER" (ID, NAME, Password, Role) VALUES ($1, $2, $3, $4)', [uid, s.name, '123456', 'Student']);
        const user = await getOne('SELECT * FROM "USER" WHERE NAME = $1', [s.name]);
        const sid = await getNextId('Students');
        await runQuery('INSERT INTO Students (ID, CODE, NAME, USER_ID, Email, Department) VALUES ($1, $2, $3, $4, $5, $6)', [sid, s.uid, s.name, user.id, s.name.toLowerCase() + '@evo.edu', 'Section ' + s.section]);
      }
    }
    console.log('Students Seeded.');

    // 3. Courses
    const courseMap = {};
    for (const c of courses) {
      let crs = await getOne('SELECT * FROM Course WHERE NAME = $1', [c]);
      if (!crs) {
        await runQuery('INSERT INTO Course (NAME) VALUES ($1)', [c]);
        crs = await getOne('SELECT * FROM Course WHERE NAME = $1', [c]);
      }
      courseMap[c] = crs.id;
    }
    console.log('Courses Seeded.');

    // 4. Lectures (Timetable)
    for (const slot of schedule) {
      const docId = docMap[slot.doc];
      const crsId = courseMap[slot.course];
      
      // Check if this specific lecture slot exists
      const existing = await getOne(
        'SELECT * FROM Lecture WHERE Course_id = $1 AND Doctor_id = $2 AND day_of_week = $3 AND start_time = $4 AND section_num = $5',
        [crsId, docId, slot.day, slot.start, slot.section]
      );
      if (!existing) {
        await runQuery(
          'INSERT INTO Lecture (Course_id, Doctor_id, day_of_week, start_time, end_time, section_num) VALUES ($1, $2, $3, $4, $5, $6)',
          [crsId, docId, slot.day, slot.start, slot.end, slot.section]
        );
      }
    }
    console.log('Timetable Seeded successfully!');

  } catch (err) {
    console.error(err);
  }
  process.exit();
}

seed();
