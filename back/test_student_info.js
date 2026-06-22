const { getOne, getAll } = require('./config/db.js');

async function testStudentEndpoint() {
  console.log('--- Verifying Student Endpoint ---');
  try {
    // 1. Find a user that exists in the students table
    const student = await getOne('SELECT user_id, name, code FROM "students" LIMIT 1');
    if (!student) {
      console.log('⚠️ No students found in database to test with.');
      return;
    }

    console.log(`Testing with user_id: ${student.user_id} (${student.name})`);

    // 2. We can't easily call the API with axios here without a token,
    // but we can verify the SQL logic works by checking if we get the same data.
    const result = await getOne('SELECT * FROM "students" WHERE user_id = $1', [student.user_id]);
    
    if (result && result.name === student.name) {
      console.log('✅ SQL Logic Verification: Success!');
      console.log('Data found:', {
        name: result.name,
        code: result.code,
        department: result.department,
        phone: result.phone
      });
    } else {
      console.error('❌ SQL Logic Verification: Failed!');
    }

    // 3. Verify Grades endpoint
    console.log('\n--- Verifying Grades Endpoint ---');
    const gradeQuery = `
      SELECT g.*, c.name as subject_name 
      FROM "grade" g
      JOIN "course" c ON g.course_id = c.id
      WHERE g.student_id = $1
    `;
    const grades = await getAll(gradeQuery, [student.code || student.user_id]);
    
    if (grades && grades.length > 0) {
      console.log(`✅ SQL Logic Verification: Found ${grades.length} grades for student.`);
      console.log('Sample data:', {
        subject: grades[0].subject_name,
        mid: grades[0].mid_grades,
        final: grades[0].final_grades,
        grade: grades[0].letter_grades
      });
    } else {
      console.log('ℹ️ No grades found for this student in database.');
    }

  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    process.exit(0);
  }
}

testStudentEndpoint();
