const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "lecture"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from lecture:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "lecture" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from lecture:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET lectures by student ID (via enrollments)
router.get('/student/:studentId', async (req, res) => {
  try {
    const query = `
      SELECT l.*, c.name as course_name
      FROM "lecture" l
      JOIN "enrollments" e ON l.course_id = e.course_id
      JOIN "course" c ON e.course_id = c.id
      WHERE e.student_id = $1
    `;
    const data = await getAll(query, [req.params.studentId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching lectures for student:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { doctor_id, course_id, name, schedule_day, time_slot, room, live_url, status } = req.body;
    const result = await runQuery('INSERT INTO "lecture" (doctor_id, course_id, name, schedule_day, time_slot, room, live_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [req.body.doctor_id, req.body.course_id, req.body.name, req.body.schedule_day, req.body.time_slot, req.body.room, req.body.live_url, req.body.status]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into lecture:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { doctor_id, course_id, name, schedule_day, time_slot, room, live_url, status } = req.body;
    const result = await runQuery('UPDATE "lecture" SET doctor_id = $1, course_id = $2, name = $3, schedule_day = $4, time_slot = $5, room = $6, live_url = $7, status = $8 WHERE id = $9 RETURNING *', [req.body.doctor_id, req.body.course_id, req.body.name, req.body.schedule_day, req.body.time_slot, req.body.room, req.body.live_url, req.body.status, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in lecture:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "lecture" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from lecture:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
