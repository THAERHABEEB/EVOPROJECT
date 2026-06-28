const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

router.use(authenticateToken);

function letterToGpaPoints(letter) {
  const l = (letter || '').trim().toUpperCase();
  if (['A+', 'A'].includes(l)) return 4.0;
  if (l === 'B+') return 3.3;
  if (l === 'B') return 3.0;
  if (l === 'C+') return 2.3;
  if (l === 'C') return 2.0;
  if (l === 'D') return 1.0;
  return 0;
}

function weekKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

async function resolveClassRanking(studentId, department, storedRanking) {
  const trimmed = (storedRanking || '').trim();
  if (trimmed && trimmed.toUpperCase() !== 'N/A') {
    return trimmed;
  }

  if (!department) return 'N/A';

  try {
    const departmentRanks = await getAll(`
      SELECT s.id AS st_id,
        COALESCE(AVG(CAST(NULLIF(TRIM(g.final_grades::text), '') AS NUMERIC)), 0) AS avg_grade
      FROM "students" s
      LEFT JOIN "grade" g ON s.id = g.student_id
      WHERE s.department = $1
      GROUP BY s.id
      ORDER BY avg_grade DESC
    `, [department]);

    const idx = departmentRanks.findIndex((r) => String(r.st_id) === String(studentId));
    if (idx === -1) return 'N/A';
    return `${idx + 1} of ${departmentRanks.length || 1}`;
  } catch (e) {
    console.warn('[Stats] Ranking calculation error:', e.message);
    return trimmed || 'N/A';
  }
}

// GET statistics for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`[Stats] Fetching stats for student ID: ${studentId}`);

    if (!studentId || studentId === 'undefined') {
      return res.status(400).json({ status: 'error', error: 'Invalid Student ID' });
    }

    const student = await getOne(
      'SELECT id, department, class_ranking, year_level FROM "students" WHERE id = $1',
      [studentId]
    );

    let subjectGrades = [];
    let averageGrade = 0;
    let gpa = 0;
    let gpaTrend = [];

    // 1. Fetch Grades (Defensive)
    try {
      const gradesQuery = `
        SELECT g.*, c.name AS subject_name, c.total_grade, c.year_level
        FROM "grade" g
        JOIN "course" c ON g.course_id = c.id
        WHERE g.student_id = $1
      `;
      const grades = await getAll(gradesQuery, [studentId]) || [];

      let totalPoints = 0;
      let totalPossible = 0;
      let totalGpaPoints = 0;
      let gpaCount = 0;
      const gpaTrendMap = {};

      subjectGrades = grades.map((g) => {
        const score = (parseFloat(g.sup_grades) || 0) + (parseFloat(g.mid_grades) || 0) + (parseFloat(g.final_grades) || 0);
        const possible = parseFloat(g.total_grade) || 100;
        const pct = possible > 0 ? Math.round((score / possible) * 100) : Math.round(parseFloat(g.final_grades) || 0);
        totalPoints += score;
        totalPossible += possible;

        const points = letterToGpaPoints(g.letter_grades);
        if (g.letter_grades || g.final_grades) {
          totalGpaPoints += points;
          gpaCount += 1;
        }

        if (g.semester_id) {
          if (!gpaTrendMap[g.semester_id]) gpaTrendMap[g.semester_id] = { total: 0, count: 0 };
          gpaTrendMap[g.semester_id].total += points;
          gpaTrendMap[g.semester_id].count += 1;
        }

        return {
          subject: g.subject_name || 'Unknown',
          score: pct,
          year_level: g.year_level || student?.year_level || 1,
        };
      });

      averageGrade = totalPossible > 0
        ? Math.round((totalPoints / totalPossible) * 100)
        : (grades.length > 0
          ? Math.round(grades.reduce((sum, g) => sum + (parseFloat(g.final_grades) || 0), 0) / grades.length)
          : 0);

      gpa = gpaCount > 0
        ? totalGpaPoints / gpaCount
        : (averageGrade / 100) * 4;

      gpaTrend = Object.keys(gpaTrendMap)
        .sort((a, b) => Number(a) - Number(b))
        .map((sem) => ({
          semester: `Sem ${sem}`,
          gpa: parseFloat((gpaTrendMap[sem].total / gpaTrendMap[sem].count).toFixed(2)),
        }));

      if (gpaTrend.length === 0 && gpa > 0) {
        gpaTrend = [{ semester: 'Current', gpa: parseFloat(gpa.toFixed(2)) }];
      }
    } catch (e) {
      console.warn('[Stats] Grade/Course tables error:', e.message);
    }

    let attendanceRecords = [];
    let presentCount = 0;
    let totalAttendance = 0;
    let attendanceHistory = [];
    let attendanceTrend = [];

    // 2. Fetch Attendance Stats (Defensive)
    try {
      const attendanceQuery = `
        SELECT a.*, c.name AS course_name 
        FROM "attendance" a
        LEFT JOIN "lecture" l ON a.lecture_id = l.id
        LEFT JOIN "course" c ON l.course_id = c.id
        WHERE a.student_id = $1
        ORDER BY a.date DESC
      `;
      attendanceRecords = await getAll(attendanceQuery, [studentId]) || [];
      presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
      totalAttendance = attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0;

      attendanceHistory = attendanceRecords.map((r) => ({
        date: r.date,
        course: r.course_name || 'General',
        status: r.status,
      }));

      const weekMap = {};
      attendanceRecords.forEach((r) => {
        const key = weekKey(r.date);
        if (!key) return;
        if (!weekMap[key]) weekMap[key] = { present: 0, absent: 0 };
        if (r.status === 'present') weekMap[key].present += 1;
        else weekMap[key].absent += 1;
      });

      attendanceTrend = Object.keys(weekMap)
        .sort()
        .slice(-6)
        .map((key, i) => ({
          week: `W${i + 1}`,
          present: weekMap[key].present,
          absent: weekMap[key].absent,
        }));

      if (attendanceTrend.length === 0) {
        attendanceTrend = [{ week: 'Current', present: presentCount, absent: attendanceRecords.length - presentCount }];
      }
    } catch (e) {
      console.warn('[Stats] Attendance table error:', e.message);
    }

    // 3. Fetch Assignment / Quiz Stats (Defensive)
    let submissions = [];
    let activityData = [];
    try {
      const assignmentsQuery = `
        SELECT score, submitted_at
        FROM "quiz_submission"
        WHERE student_id = $1
        ORDER BY submitted_at ASC
      `;
      submissions = await getAll(assignmentsQuery, [studentId]) || [];

      const activityWeekMap = {};
      submissions.forEach((s) => {
        const key = weekKey(s.submitted_at);
        if (!key) return;
        if (!activityWeekMap[key]) activityWeekMap[key] = { assignments: 0, quizzes: 0 };
        activityWeekMap[key].quizzes += 1;
        activityWeekMap[key].assignments += 1;
      });

      try {
        const studentActivities = await getAll(`
          SELECT sa.registration_date
          FROM "student_activity" sa
          WHERE sa.student_id = $1
          ORDER BY sa.registration_date ASC
        `, [studentId]) || [];

        studentActivities.forEach((a) => {
          const key = weekKey(a.registration_date);
          if (!key) return;
          if (!activityWeekMap[key]) activityWeekMap[key] = { assignments: 0, quizzes: 0 };
          activityWeekMap[key].assignments += 1;
        });
      } catch (actErr) {
        console.warn('[Stats] Student activity table error:', actErr.message);
      }

      activityData = Object.keys(activityWeekMap)
        .sort()
        .slice(-6)
        .map((key, i) => ({
          week: `W${i + 1}`,
          assignments: activityWeekMap[key].assignments,
          quizzes: activityWeekMap[key].quizzes,
        }));

      if (activityData.length === 0) {
        activityData = [{
          week: 'Current',
          assignments: submissions.length,
          quizzes: submissions.length > 0 ? submissions.length : 0,
        }];
      }
    } catch (e) {
      console.warn('[Stats] Quiz submission table error:', e.message);
    }

    const ranking = await resolveClassRanking(
      studentId,
      student?.department,
      student?.class_ranking
    );

    const assignmentStatus = submissions.length > 0 ? [
      { name: 'Submitted', value: submissions.length, color: '#6fc3ff' },
      { name: 'Pending', value: 0, color: '#f39c12' },
      { name: 'Missed', value: 0, color: '#ff6b6b' },
    ] : [
      { name: 'No Data', value: 1, color: '#333' },
    ];

    res.json({
      status: 'success',
      data: {
        gpa: parseFloat(gpa || 0).toFixed(2),
        averageGrade: averageGrade || 0,
        totalAttendance: totalAttendance || 0,
        ranking,
        classRanking: student?.class_ranking || null,
        subjectGrades,
        gpaTrend,
        assignmentStatus,
        attendanceTrend,
        attendanceHistory,
        activityData,
      },
    });

  } catch (error) {
    console.error('[Stats] Critical failure:', error);
    res.status(500).json({ status: 'error', error: 'Critical Database error', details: error.message });
  }
});

// GET statistics for a specific doctor
router.get('/doctor/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Resolve Doctor ID from USER ID
    const doctorRecord = await getOne('SELECT id FROM "doctor" WHERE user_id = $1', [userId]);
    if (!doctorRecord) {
      return res.status(404).json({ status: 'error', error: 'Doctor not found' });
    }
    const doctorId = doctorRecord.id;

    // 1. Attendance Rate across all courses
    const attendanceQuery = `
      SELECT a.status, COUNT(*) as count
      FROM "attendance" a
      JOIN "course" c ON a.course_id = c.id
      WHERE c.doctor_id = $1
      GROUP BY a.status
    `;
    const attendanceStats = await getAll(attendanceQuery, [doctorId]);
    const totalAttendance = attendanceStats.reduce((acc, curr) => acc + parseInt(curr.count), 0);
    const presentCount = attendanceStats.find(s => s.status === 'present')?.count || 0;
    const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

    // 2. Grade Distribution
    const gradesQuery = `
      SELECT g.letter_grades, COUNT(*) as count
      FROM "grade" g
      JOIN "course" c ON g.course_id = c.id
      WHERE c.doctor_id = $1 AND g.letter_grades IS NOT NULL AND g.letter_grades != ''
      GROUP BY g.letter_grades
    `;
    const gradesDist = await getAll(gradesQuery, [doctorId]);

    // 3. Total Students
    const studentsRes = await getOne(`
      SELECT COUNT(DISTINCT e.student_id) as count
      FROM enrollments e
      JOIN course c ON e.course_id = c.id
      WHERE c.doctor_id = $1
    `, [doctorId]);

    // 4. Activity (Last 6 weeks dummy trend but based on real counts)
    const activityCount = await getOne(`
      SELECT COUNT(*) as count FROM quiz q WHERE q.doctor_id = $1
    `, [doctorId]);

    res.json({
      status: 'success',
      data: {
        attendanceRate: `${attendanceRate}%`,
        totalStudents: studentsRes.count || 0,
        totalAssignments: activityCount.count || 0,
        successRate: '85%', // Placeholder or calculated from grades
        attendanceData: [
          { day: 'General', present: parseInt(presentCount), absent: totalAttendance - presentCount }
        ],
        gradesData: gradesDist.map(g => ({ grade: g.letter_grades, count: parseInt(g.count) })),
        classDistribution: [
          { name: 'Enrolled Students', value: parseInt(studentsRes.count || 0), color: '#6fc3ff' }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
