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
    // 1. Get student's department
    const student = await getOne('SELECT department, current_semester, year_level FROM "students" WHERE id = $1', [studentId]);
    if (!student || !student.department) {
      return res.status(404).json({ status: 'error', error: 'Student or department not found' });
    }

    // 2. Find specialization matching department name (Fuzzy Match)
    const spec = await getOne('SELECT id FROM "specialization" WHERE name ILIKE $1 OR $2 ILIKE \'%\' || name || \'%\'', [`%${student.department}%`, student.department]);
    if (!spec) {
      return res.status(404).json({ status: 'error', error: 'Specialization not found for department: ' + student.department });
    }

    // 3. Fetch all study plans for this specialization
    // We order them by year_name, but we might need a better sorting in JS later
    const plans = await getAll('SELECT id, year_name, model FROM "study_plan" WHERE spec_id = $1 ORDER BY year_name ASC', [spec.id]);
    
    // Sort plans properly: Year 1 before Year 2, Semester 1 before Semester 2
    plans.sort((a, b) => {
        const getVal = (s) => {
            const year = parseInt(s.match(/Year (\d+)/)?.[1] || 0);
            const sem = parseInt(s.match(/Semester (\d+)/)?.[1] || 0);
            return year * 10 + sem;
        };
        return getVal(a.year_name) - getVal(b.year_name);
    });

    // 4. Fetch lecture counts per course to determine progress
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

    res.json({ 
      status: 'success', 
      current_semester: student.current_semester,
      year_level: student.year_level,
      course_progress: courseProgressMap,
      data: plans 
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET recorded lectures for a student
router.get('/:id/recorded-lectures', async (req, res) => {
  try {
    const studentId = req.params.id;
    const query = `
      SELECT 
        m.id, 
        c.name as subject, 
        m.name as title, 
        d.name as instructor, 
        m.file_size as duration, 
        m.folder as url
      FROM "lecture_materials" m
      JOIN "lecture" l ON m.lecture_id = l.id
      JOIN "course" c ON l.course_id = c.id
      JOIN "doctor" d ON l.doctor_id = d.id
      JOIN "students" s ON s.id = $1
      JOIN "specialization" sp ON s.department LIKE '%' || sp.name || '%' AND c.specialization_id = sp.id
      WHERE l.status = 'Recorded'
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
