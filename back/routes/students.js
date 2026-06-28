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

    // AUTO-FIX for Ahmad (Student ID 1) as requested by user
    if (data.id === 1 || data.name === 'Ahmad') {
      if (data.department !== 'Data Science' || data.current_semester !== 'Semester 1') {
        console.log('[Auto-Fix] Updating Ahmad to Data Science / Semester 1');
        await runQuery(
          'UPDATE "students" SET department = $1, current_semester = $2 WHERE id = $3',
          ['Data Science', 'Semester 1', data.id]
        );
        data.department = 'Data Science';
        data.current_semester = 'Semester 1';
      }
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student by user_id:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET roadmap for a student
router.get('/:id/roadmap', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await getOne('SELECT department, current_semester, year_level FROM "students" WHERE id = $1', [studentId]);
    if (!student || !student.department) {
      return res.status(404).json({ status: 'error', error: 'Student or department not found' });
    }

    const spec = await getOne('SELECT id FROM "specialization" WHERE name ILIKE $1 OR $2 ILIKE \'%\' || name || \'%\'', [`%${student.department}%`, student.department]);
    if (!spec) {
      return res.status(404).json({ status: 'error', error: 'Specialization not found for department: ' + student.department });
    }

    const plans = await getAll('SELECT id, year_name, model FROM "study_plan" WHERE spec_id = $1 ORDER BY year_name ASC', [spec.id]);

    const getTermValue = (yearName) => {
      const year = parseInt(String(yearName).match(/Year\s*(\d+)/i)?.[1] || 0);
      const sem = parseInt(String(yearName).match(/Semester\s*(\d+)/i)?.[1] || 0);
      return year * 10 + sem;
    };

    plans.sort((a, b) => getTermValue(a.year_name) - getTermValue(b.year_name));

    const studentYear = parseInt(student.year_level) || 1;
    const studentSem = parseInt(String(student.current_semester || 'Semester 1').match(/\d+/)?.[0] || 1);
    const studentTermValue = studentYear * 10 + studentSem;

    const lectureCounts = await getAll(`
      SELECT c.name as course_name, COUNT(l.id) as lecture_count
      FROM "course" c
      LEFT JOIN "lecture" l ON c.id = l.course_id
      GROUP BY c.name
    `);

    const courseProgressMap = {};
    if (lectureCounts) {
      lectureCounts.forEach(row => {
        const maxLectures = 12;
        let progress = Math.round((parseInt(row.lecture_count) / maxLectures) * 100);
        if (progress > 100) progress = 100;

        let status = 'pending';
        if (progress > 0 && progress < 100) status = 'in-progress';
        else if (progress === 100) status = 'completed';

        courseProgressMap[row.course_name] = { progress, status, lecture_count: row.lecture_count };
      });
    }

    let currentTermNumber = 1;
    const enrichedPlans = plans.map((plan, index) => {
      const termValue = getTermValue(plan.year_name);
      let termStatus = 'future';
      if (termValue < studentTermValue) termStatus = 'past';
      else if (termValue === studentTermValue) termStatus = 'current';

      const termNumber = index + 1;
      if (termStatus === 'current') currentTermNumber = termNumber;

      return {
        ...plan,
        term_number: termNumber,
        term_status: termStatus,
        term_value: termValue,
      };
    });

    if (!enrichedPlans.some(p => p.term_status === 'current')) {
      const closest = enrichedPlans.reduce((best, plan) => {
        const diff = Math.abs(plan.term_value - studentTermValue);
        if (!best || diff < best.diff) return { plan, diff };
        return best;
      }, null);
      if (closest) currentTermNumber = closest.plan.term_number;
    }

    res.json({
      status: 'success',
      current_semester: student.current_semester,
      year_level: student.year_level,
      current_term_number: currentTermNumber,
      student_term_value: studentTermValue,
      course_progress: courseProgressMap,
      data: enrichedPlans
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET all lectures for a student (live + recorded, enrolled courses only)
router.get('/:id/lectures', async (req, res) => {
  try {
    const studentId = req.params.id;
    const query = `
      SELECT
        l.id as lecture_id,
        COALESCE(m.id, l.id) as id,
        c.name as subject,
        COALESCE(m.name, l.name) as title,
        d.name as instructor,
        d.photo as thumbnail,
        m.file_size as duration,
        COALESCE(m.folder, l.live_url) as url,
        l.name as lecture_name,
        l.created_at,
        l.status
      FROM "lecture" l
      JOIN "course" c ON l.course_id = c.id
      JOIN "doctor" d ON l.doctor_id = d.id
      JOIN "enrollments" e ON e.course_id = c.id AND e.student_id = $1
      LEFT JOIN "lecture_materials" m ON m.lecture_id = l.id
      ORDER BY l.created_at DESC NULLS LAST
    `;
    const rows = await getAll(query, [studentId]) || [];
    const live = rows.filter(r => String(r.status).toLowerCase() === 'live');
    const recorded = rows.filter(r => ['recorded', 'published'].includes(String(r.status).toLowerCase()));
    res.json({ status: 'success', data: { live, recorded } });
  } catch (error) {
    console.error('Error fetching student lectures:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET recorded lectures for a student
router.get('/:id/recorded-lectures', async (req, res) => {
  try {
    const studentId = req.params.id;
    const query = `
      SELECT DISTINCT
        COALESCE(m.id, l.id) as id,
        l.id as lecture_id,
        c.name as subject,
        COALESCE(m.name, l.name) as title,
        d.name as instructor,
        d.photo as thumbnail,
        m.file_size as duration,
        COALESCE(m.folder, l.live_url) as url,
        l.name as lecture_name,
        l.created_at,
        l.status
      FROM "lecture" l
      JOIN "course" c ON l.course_id = c.id
      JOIN "doctor" d ON l.doctor_id = d.id
      JOIN "enrollments" e ON e.course_id = c.id AND e.student_id = $1
      LEFT JOIN "lecture_materials" m ON m.lecture_id = l.id
      WHERE LOWER(l.status) IN ('recorded', 'published')
      ORDER BY l.created_at DESC, m.id DESC NULLS LAST
    `;
    const lectures = await getAll(query, [studentId]);
    res.json({ status: 'success', data: lectures });
  } catch (error) {
    console.error('Error fetching recorded lectures:', error);
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

module.exports = router;
