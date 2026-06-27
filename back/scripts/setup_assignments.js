const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_q1BraQwg7ust@ep-dry-wildflower-ankkdke1-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    console.log('Creating course_assignments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS course_assignments (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(50) NOT NULL,
        doctor_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        details TEXT,
        file_url TEXT,
        image_url TEXT,
        start_date TIMESTAMP NOT NULL DEFAULT NOW(),
        end_date TIMESTAMP NOT NULL,
        total_grade NUMERIC NOT NULL
      );
    `);

    console.log('Creating assignment_submissions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER NOT NULL REFERENCES course_assignments(id) ON DELETE CASCADE,
        student_id INTEGER NOT NULL,
        file_url TEXT NOT NULL,
        submission_date TIMESTAMP NOT NULL DEFAULT NOW(),
        grade NUMERIC,
        status VARCHAR(50) DEFAULT 'submitted'
      );
    `);

    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error setting up tables:', error);
  } finally {
    pool.end();
  }
}

setup();
