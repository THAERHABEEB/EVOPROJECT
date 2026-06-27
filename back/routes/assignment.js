const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "assignment"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "assignment" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET assignments by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "assignment" WHERE student_id = $1', [req.params.studentId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from assignment for student:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { lec_mat_id, student_id, start_date, end_date } = req.body;
    const result = await runQuery('INSERT INTO "assignment" (lec_mat_id, student_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.lec_mat_id, req.body.student_id, req.body.start_date, req.body.end_date]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { lec_mat_id, student_id, start_date, end_date } = req.body;
    const result = await runQuery('UPDATE "assignment" SET lec_mat_id = $1, student_id = $2, start_date = $3, end_date = $4 WHERE id = $5 RETURNING *', [req.body.lec_mat_id, req.body.student_id, req.body.start_date, req.body.end_date, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "assignment" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
