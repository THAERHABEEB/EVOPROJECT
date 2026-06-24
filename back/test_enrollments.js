const { getAll } = require('./config/db');
async function test() {
  try {
    const student = await getAll('SELECT * FROM students LIMIT 1');
    const studentId = student[0].id;
    console.log('studentId:', studentId);
    
    const enrollments = await getAll('SELECT * FROM enrollments WHERE student_id = $1', [studentId]);
    console.log('enrollments length:', enrollments.length);
    
    const grades = await getAll('SELECT * FROM grade WHERE student_id = $1', [studentId]);
    console.log('grades length:', grades.length);
    
    const query = `
      SELECT 
        c.name as subject_name,
        c.total_grade,
        g.id, g.sup_grades, g.mid_grades, g.final_grades, g.letter_grades,
        e.course_id
      FROM "enrollments" e
      JOIN "course" c ON e.course_id = c.id
      LEFT JOIN "grade" g ON g.student_id = e.student_id AND g.course_id = e.course_id
      WHERE e.student_id = $1
    `;
    const gradesData = await getAll(query, [studentId]);
    console.log('gradesData:', gradesData);
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
