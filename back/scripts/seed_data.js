const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_q1BraQwg7ust@ep-dry-wildflower-ankkdke1-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    // 1. Get Doctor Aber or create
    let docRes = await pool.query("SELECT id FROM doctor WHERE name ILIKE '%Aber%'");
    let docId;
    if (docRes.rows.length === 0) {
       const ins = await pool.query("INSERT INTO doctor (name, email) VALUES ('Dr. Aber', 'aber@hitu.edu') RETURNING id");
       docId = ins.rows[0].id;
    } else {
       docId = docRes.rows[0].id;
    }

    // 2. Get Student Thaer or create
    let stuRes = await pool.query("SELECT id FROM students WHERE name ILIKE '%Thaer%'");
    let stuId;
    if (stuRes.rows.length === 0) {
       const ins = await pool.query("INSERT INTO students (name, email) VALUES ('Thaer Ibrahim Kamel Habeeb', 'thaer@student.hitu.edu') RETURNING id");
       stuId = ins.rows[0].id;
    } else {
       stuId = stuRes.rows[0].id;
    }

    // 3. Get Course or create
    let crsRes = await pool.query("SELECT id FROM course WHERE id = 'CS101'");
    if (crsRes.rows.length === 0) {
       // NOTE: in the schema 'course' had columns like Doctor_id, doctor_id, name, id
       await pool.query("INSERT INTO course (id, name, doctor_id) VALUES ('CS101', 'Data Engineering', $1)", [docId]);
    }

    // 4. Enroll Thaer in CS101
    let enrRes = await pool.query("SELECT id FROM enrollments WHERE student_id = $1 AND course_id = 'CS101'", [stuId]);
    if (enrRes.rows.length === 0) {
       let maxRes = await pool.query("SELECT COALESCE(MAX(id), 0) + 1 as new_id FROM enrollments");
       await pool.query("INSERT INTO enrollments (id, student_id, course_id) VALUES ($1, $2, 'CS101')", [maxRes.rows[0].new_id, stuId]);
    }

    // 5. Add a recorded lecture by Dr. Aber for CS101
    await pool.query("INSERT INTO lecture (doctor_id, course_id, name, status, live_url) VALUES ($1, 'CS101', 'Week 6 - Data Engineering', 'recorded', 'https://www.youtube.com/watch?v=123')", [docId]);

    // 6. Add an assignment by Dr. Aber for Thaer
    await pool.query("INSERT INTO assignment (student_id, title, start_date, end_date) VALUES ($1, 'Midterm Project', NOW(), NOW() + INTERVAL '7 days')", [stuId]);

    console.log('Seeding finished successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    pool.end();
  }
}
seed();
