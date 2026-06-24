const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "grade"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from grade:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "grade" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from grade:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET grades for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.name as subject_name,
        c.total_grade,
        g.id, g.sup_grades, g.mid_grades, g.final_grades, g.letter_grades,
        g.course_id
      FROM "grade" g
      LEFT JOIN "course" c ON g.course_id = c.id
      WHERE g.student_id = $1
    `;
    const data = await getAll(query, [req.params.studentId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { student_id, course_id, semester_id, sup_grades, mid_grades, final_grades, letter_grades } = req.body;
    const result = await runQuery('INSERT INTO "grade" (student_id, course_id, semester_id, sup_grades, mid_grades, final_grades, letter_grades) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [req.body.student_id, req.body.course_id, req.body.semester_id, req.body.sup_grades, req.body.mid_grades, req.body.final_grades, req.body.letter_grades]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into grade:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { student_id, course_id, semester_id, sup_grades, mid_grades, final_grades, letter_grades } = req.body;
    const result = await runQuery('UPDATE "grade" SET student_id = $1, course_id = $2, semester_id = $3, sup_grades = $4, mid_grades = $5, final_grades = $6, letter_grades = $7 WHERE id = $8 RETURNING *', [req.body.student_id, req.body.course_id, req.body.semester_id, req.body.sup_grades, req.body.mid_grades, req.body.final_grades, req.body.letter_grades, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in grade:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "grade" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from grade:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
