const { getAll, getOne, runQuery } = require('./config/db.js');

async function testStats(userId) {
  try {
    const student = await getOne('SELECT * FROM "students" WHERE user_id = $1', [userId]);
    if (!student) { console.log('Student not found'); return; }
    const studentId = student.id;

    const grades = await getAll(`
      SELECT g.final_grades, g.letter_grades, g.semester_id, c.name as course_name 
      FROM grade g 
      LEFT JOIN course c ON g.course_id = c.id 
      WHERE g.student_id = $1
    `, [studentId]);

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

    const gpa = grades.length > 0 ? (totalGpaPoints / grades.length).toFixed(2) : 0;
    const averageGrade = grades.length > 0 ? (totalGradePercentage / grades.length).toFixed(1) : 0;

    const gpaTrend = Object.keys(gpaTrendMap).sort((a,b)=>a-b).map(sem => ({
      semester: `S${sem}`,
      gpa: parseFloat((gpaTrendMap[sem].total / gpaTrendMap[sem].count).toFixed(2))
    }));

    const rankQuery = `
      SELECT s.id as st_id, COALESCE(AVG(CAST(NULLIF(TRIM(g.final_grades), '') AS NUMERIC)), 0) as avg_grade
      FROM "students" s
      LEFT JOIN grade g ON s.id = g.student_id
      WHERE s.department = $1
      GROUP BY s.id
      ORDER BY avg_grade DESC
    `;
    const departmentRanks = await getAll(rankQuery, [student.department]);
    let myRank = 0;
    for (let i = 0; i < departmentRanks.length; i++) {
      if (departmentRanks[i].st_id === studentId) {
        myRank = i + 1;
        break;
      }
    }
    const ranking = `${myRank} of ${departmentRanks.length || 1}`;

    console.log({
      gpa, averageGrade, ranking, gpaTrend, subjectGrades
    });

  } catch (error) {
    console.error(error);
  }
}

testStats(1).then(() => process.exit());
