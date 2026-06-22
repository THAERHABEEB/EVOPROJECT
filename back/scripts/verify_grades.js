const { getAll, getOne, runQuery } = require('../config/db.js');
const path = require('path');
const fs = require('fs');

async function verify() {
  console.log('--- Starting Verification ---');

  try {
    // 1. Check if we have any doctors
    const doctors = await getAll('SELECT id, user_id FROM "doctor" LIMIT 1');
    if (doctors.length === 0) {
      console.log('❌ No doctors found to test with.');
      return;
    }
    const drId = doctors[0].id;
    console.log(`✅ Found doctor ID: ${drId}`);

    // 2. Test GET /doctor/:id/courses logic
    const coursesRes = await getAll(`
      SELECT c.id, c.name 
      FROM Course c 
      JOIN Lecture l ON c.ID = l.Course_id 
      WHERE l.Doctor_id = $1
    `, [drId]);
    console.log(`✅ Found ${coursesRes.length} courses for doctor.`);
    
    if (coursesRes.length > 0) {
      const courseId = coursesRes[0].id;
      
      // 3. Test GET /course/:id/students logic
      const studentsRes = await getAll(`
        SELECT s.ID, s.NAME 
        FROM Students s 
        JOIN Enrollments e ON s.ID = e.Student_id 
        WHERE e.Course_id = $1
      `, [courseId]);
      console.log(`✅ Found ${studentsRes.length} students enrolled in course ${courseId}.`);

      // 4. Test grade submission simulation
      // (Simplified check for the logic in upload_grades.js/submit)
      const courseData = await getOne('SELECT specialization_id, year_level FROM "course" WHERE id = $1', [courseId]);
      const control = await getOne('SELECT id FROM "control" LIMIT 1');
      
      if (courseData && control) {
        console.log('✅ Found course and control data for submission.');
      } else {
        console.log('⚠️ Missing course or control data for full submission test.');
      }
    }

    console.log('--- Verification Complete ---');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verify();
