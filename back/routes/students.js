const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "students"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from students:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "students" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from students:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET student by user_id
router.get('/user/:userId', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "students" WHERE user_id = $1', [req.params.userId]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Student profile not found for this user' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student by user_id:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { user_id, name, code, phone, address, department, photo, date_of_birth, age, email, status, current_semester, year_level } = req.body;
    const result = await runQuery('INSERT INTO "students" (user_id, name, code, phone, address, department, photo, date_of_birth, age, email, age, status, current_semester, year_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *', [req.body.user_id, req.body.name, req.body.code, req.body.phone, req.body.address, req.body.department, req.body.photo, req.body.date_of_birth, req.body.age, req.body.email, req.body.age, req.body.status, req.body.current_semester, req.body.year_level]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into students:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { user_id, name, code, phone, address, department, photo, date_of_birth, email, age, status, current_semester, year_level } = req.body;
    const result = await runQuery('UPDATE "students" SET user_id = $1, name = $2, code = $3, phone = $4, address = $5, department = $6, photo = $7, date_of_birth = $8, age = $9, email = $10, age = $11, status = $12, current_semester = $13, year_level = $14 WHERE id = $15 RETURNING *', [req.body.user_id, req.body.name, req.body.code, req.body.phone, req.body.address, req.body.department, req.body.photo, req.body.date_of_birth, req.body.age, req.body.email, req.body.age, req.body.status, req.body.current_semester, req.body.year_level, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in students:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update specialization for a student (first-time only enforced by frontend)
router.put('/:id/specialization', async (req, res) => {
  try {
    const { specialization } = req.body;
    const result = await runQuery('UPDATE "students" SET department = $1 WHERE user_id = $2 RETURNING *', [specialization, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Student not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating student specialization:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET - Academic roadmap (8 semesters) with progress based on current_semester
router.get('/:id/roadmap', async (req, res) => {
  try {
    const student = await getOne('SELECT current_semester, department as specialization FROM "students" WHERE user_id = $1', [req.params.id]);
    if (!student) return res.status(404).json({ status: 'error', error: 'Student not found' });
    
    const currentStr = String(student.current_semester).replace(/[^0-9]/g, '');
    const current = Number(currentStr) || 0;
    
    const semesters = [];
    for (let i = 1; i <= 8; i++) {
      semesters.push({ semester: i, completed: i <= current });
    }
    res.json({ status: 'success', data: { specialization: student.specialization || null, current_semester: current, semesters } });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "students" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from students:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET - Dynamic Academic Performance Statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const userId = req.params.id;
    // 1. Get student profile
    const student = await getOne('SELECT * FROM "students" WHERE user_id = $1', [userId]);
    if (!student) return res.status(404).json({ status: 'error', error: 'Student not found' });
    const studentId = student.id;

    // 2. Get grades joined with course
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

    let gpaTrend = [];
    for (let i = 1; i <= 8; i++) {
      if (gpaTrendMap[i]) {
        gpaTrend.push({
          semester: `S${i}`,
          gpa: parseFloat((gpaTrendMap[i].total / gpaTrendMap[i].count).toFixed(2))
        });
      } else {
        gpaTrend.push({
          semester: `S${i}`,
          gpa: 0
        });
      }
    }

    // 3. Get Class Ranking
    const rankQuery = `
      SELECT s.id as st_id, COALESCE(AVG(CAST(NULLIF(g.final_grades::text, '') AS NUMERIC)), 0) as avg_grade
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

    // 4. Attendance
    const attendanceRecords = await getAll('SELECT * FROM attendance WHERE student_id = $1', [studentId]);
    let attendanceTrend = [];
    if (attendanceRecords.length === 0) {
      attendanceTrend = [
        { week: 'Week 1', present: 0, absent: 0 },
        { week: 'Week 2', present: 0, absent: 0 },
        { week: 'Week 3', present: 0, absent: 0 },
        { week: 'Week 4', present: 0, absent: 0 },
      ];
    } else {
      let presentCount = attendanceRecords.filter(a => String(a.status).toLowerCase() === 'present').length;
      let absentCount = attendanceRecords.filter(a => String(a.status).toLowerCase() === 'absent').length;
      attendanceTrend = [
        { week: 'Total', present: presentCount, absent: absentCount }
      ];
    }

    // 5. Assignment Status
    const quizzes = await getAll('SELECT * FROM quiz_submission WHERE student_id = $1', [studentId]);
    
    // Filter out 0 values to completely avoid Recharts PieChart crashes
    let assignmentStatusRaw = [
      { name: 'Submitted', value: quizzes.length || 0, color: '#6fc3ff' },
      { name: 'Pending', value: 0, color: '#f39c12' }, // In a real scenario, calculate from total assignments
      { name: 'Missed', value: 0, color: '#ff6b6b' },
    ];
    let assignmentStatus = assignmentStatusRaw.filter(item => item.value > 0);
    
    if (assignmentStatus.length === 0) {
      assignmentStatus = [
        { name: 'No Data', value: 1, color: 'rgba(255,255,255,0.1)' }
      ];
    }
    
    const activityData = [
      { week: 'W1', assignments: 0, quizzes: 0 },
      { week: 'W2', assignments: 0, quizzes: quizzes.length }
    ];

    res.json({
      status: 'success',
      data: {
        gpa,
        averageGrade,
        ranking,
        gpaTrend: gpaTrend.length > 0 ? gpaTrend : [{ semester: 'S1', gpa: 0 }],
        subjectGrades: subjectGrades.length > 0 ? subjectGrades : [{ subject: 'No Data', score: 0 }],
        attendanceTrend,
        assignmentStatus,
        activityData
      }
    });

  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
