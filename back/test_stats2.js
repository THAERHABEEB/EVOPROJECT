const { getAll, getOne } = require('./config/db');
async function test() {
  try {
    const studentId = 1;
    const grades = await getAll('SELECT g.final_grades, g.letter_grades, g.semester_id, c.name as course_name FROM grade g LEFT JOIN course c ON g.course_id = c.id WHERE g.student_id = $1', [studentId]);
    console.log('Grades:', grades);
    
    let totalGpaPoints = 0;
    let totalGradePercentage = 0;
    const subjectGrades = [];
    const gpaTrendMap = {}; 

    grades.forEach(g => {
      const score = parseFloat(g.final_grades) || 0;
      totalGradePercentage += score;
      let points = 0;
      const letter = (g.letter_grades || '').trim().toUpperCase();
      if (['A+', 'A'].includes(letter)) points = 4.0;
      else if (letter === 'B+') points = 3.3;
      else if (letter === 'B') points = 3.0;
      else if (letter === 'C+') points = 2.3;
      else if (letter === 'C') points = 2.0;
      else if (letter === 'D') points = 1.0;
      else points = 0;

      totalGpaPoints += points;
      subjectGrades.push({ subject: g.course_name || g.course_id || 'Unknown', score });

      if (g.semester_id) {
        if (!gpaTrendMap[g.semester_id]) gpaTrendMap[g.semester_id] = { total: 0, count: 0 };
        gpaTrendMap[g.semester_id].total += points;
        gpaTrendMap[g.semester_id].count += 1;
      }
    });
    console.log('subjectGrades:', subjectGrades);
    
    const rankQuery = `
      SELECT s.id as st_id, COALESCE(AVG(CAST(NULLIF(g.final_grades::text, '') AS NUMERIC)), 0) as avg_grade
      FROM "students" s
      LEFT JOIN grade g ON s.id = g.student_id
      WHERE s.department = 'IT'
      GROUP BY s.id
      ORDER BY avg_grade DESC
    `;
    const departmentRanks = await getAll(rankQuery);
    console.log('departmentRanks:', departmentRanks);
    
    const attendanceRecords = await getAll('SELECT * FROM attendance WHERE student_id = $1', [studentId]);
    console.log('Attendance:', attendanceRecords);
    
    const quizzes = await getAll('SELECT * FROM quiz_submission WHERE student_id = $1', [studentId]);
    console.log('Quizzes:', quizzes);

  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
