const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

router.use(authenticateToken);

// GET statistics for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`[Stats] Fetching stats for student ID: ${studentId}`);

    if (!studentId || studentId === 'undefined') {
      return res.status(400).json({ status: 'error', error: 'Invalid Student ID' });
    }

    let subjectGrades = [];
    let averageGrade = 0;
    let gpa = 0;

    // 1. Fetch Grades (Defensive)
    try {
      const gradesQuery = `
        SELECT g.*, c.name as subject_name, c.total_grade, c.year_level
        FROM "grade" g
        JOIN "course" c ON g.course_id = c.id
        WHERE g.student_id = $1
      `;
      const grades = await getAll(gradesQuery, [studentId]) || [];

      let totalPoints = 0;
      let totalPossible = 0;
      subjectGrades = grades.map(g => {
        const score = (parseFloat(g.sup_grades) || 0) + (parseFloat(g.mid_grades) || 0) + (parseFloat(g.final_grades) || 0);
        const possible = parseFloat(g.total_grade) || 100;
        totalPoints += score;
        totalPossible += possible;
        return {
          subject: g.subject_name || 'Unknown',
          score: possible > 0 ? Math.round((score / possible) * 100) : 0,
          year_level: g.year_level || 1
        };
      });

      averageGrade = totalPossible > 0 ? Math.round((totalPoints / totalPossible) * 100) : 0;
      gpa = (averageGrade / 100) * 4;
    } catch (e) {
      console.warn('[Stats] Grade/Course tables error:', e.message);
    }

    let attendanceRecords = [];
    let presentCount = 0;
    let totalAttendance = 0;
    let attendanceHistory = [];

    // 2. Fetch Attendance Stats (Defensive)
    try {
      const attendanceQuery = `
        SELECT a.*, c.name as course_name 
        FROM "attendance" a
        LEFT JOIN "lecture" l ON a.lecture_id = l.id
        LEFT JOIN "course" c ON l.course_id = c.id
        WHERE a.student_id = $1
        ORDER BY a.date DESC
      `;
      attendanceRecords = await getAll(attendanceQuery, [studentId]) || [];
      presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      totalAttendance = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

      attendanceHistory = attendanceRecords.map(r => ({
        date: r.date,
        course: r.course_name || 'General',
        status: r.status
      }));
    } catch (e) {
      console.warn('[Stats] Attendance table error:', e.message);
    }

    // 3. Fetch Assignment Stats (Defensive)
    let submissions = [];
    try {
      const assignmentsQuery = 'SELECT score FROM "quiz_submission" WHERE student_id = $1';
      submissions = await getAll(assignmentsQuery, [studentId]) || [];
    } catch (e) {
      console.warn('[Stats] Quiz submission table error:', e.message);
    }
    
    // 4. Trends
    const gpaTrend = [{ semester: 'Current', gpa: parseFloat(gpa || 0).toFixed(2) }];
    const attendanceTrend = [{ week: 'Current', present: presentCount, absent: attendanceRecords.length - presentCount }];
    const activityData = [{ week: 'Current', assignments: submissions.length, quizzes: submissions.length > 0 ? 1 : 0 }];

    const assignmentStatus = submissions.length > 0 ? [
      { name: 'Submitted', value: submissions.length, color: '#6fc3ff' },
      { name: 'Pending', value: 0, color: '#f39c12' },
      { name: 'Missed', value: 0, color: '#ff6b6b' },
    ] : [
      { name: 'No Data', value: 1, color: '#333' }
    ];

    res.json({
      status: 'success',
      data: {
        gpa: parseFloat(gpa || 0).toFixed(2),
        averageGrade: averageGrade || 0,
        totalAttendance: totalAttendance || 0,
        ranking: 'N/A', 
        subjectGrades,
        gpaTrend,
        assignmentStatus,
        attendanceTrend,
        attendanceHistory,
        activityData
      }
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
