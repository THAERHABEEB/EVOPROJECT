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
    const result = await runQuery('UPDATE "students" SET specialization = $1 WHERE id = $2 RETURNING *', [specialization, req.params.id]);
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
    const student = await getOne('SELECT id, current_semester, specialization FROM "students" WHERE id = $1', [req.params.id]);
    if (!student) return res.status(404).json({ status: 'error', error: 'Student not found' });
    const current = Number(student.current_semester) || 0;
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

module.exports = router;
