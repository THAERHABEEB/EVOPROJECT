const { getAll } = require('./config/db.js');

async function checkGrades() {
  try {
    const grades = await getAll('SELECT * FROM "grade" LIMIT 5');
    console.log('Sample Grades:', JSON.stringify(grades, null, 2));
    
    const uploadGrades = await getAll('SELECT * FROM "upload_grades" LIMIT 5');
    console.log('Sample Upload Grades:', JSON.stringify(uploadGrades, null, 2));

    const semesters = await getAll('SELECT * FROM "semesters" LIMIT 5');
    console.log('Sample Semesters:', JSON.stringify(semesters, null, 2));

  } catch (err) {
    console.error(err);
  }
}

checkGrades();
