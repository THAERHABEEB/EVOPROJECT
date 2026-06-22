const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "course"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from course:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "course" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from course:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { name, description, credit_hours, specialization_id, doctor_id, year_level, total_grade } = req.body;
    const finalTotalGrade = total_grade !== undefined ? total_grade : 150;
    const result = await runQuery('INSERT INTO "course" (NAME, Description, Credit_hours, Specialization_id, Doctor_id, Year_level, total_grade) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [req.body.name, req.body.description, req.body.credit_hours, req.body.specialization_id, req.body.doctor_id, req.body.year_level, finalTotalGrade]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into course:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, description, credit_hours, specialization_id, doctor_id, year_level, total_grade } = req.body;
    const finalTotalGrade = total_grade !== undefined ? total_grade : 150;
    const result = await runQuery('UPDATE "course" SET NAME = $1, Description = $2, Credit_hours = $3, Specialization_id = $4, Doctor_id = $5, Year_level = $6, total_grade = $7 WHERE id = $8 RETURNING *', [req.body.name, req.body.description, req.body.credit_hours, req.body.specialization_id, req.body.doctor_id, req.body.year_level, finalTotalGrade, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in course:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "course" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from course:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET all students enrolled in a course with their grades
router.get('/:id/students', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.ID, 
        s.NAME, 
        s.Department, 
        s.Year_level, 
        g.Mid_Grades, 
        g.Final_Grades, 
        g.Sup_Grades, 
        g.Letter_Grades 
      FROM Students s 
      JOIN Enrollments e ON s.ID = e.Student_id 
      LEFT JOIN Grade g ON (s.ID = g.Student_id AND e.Course_id = g.Course_id) 
      WHERE e.Course_id = $1
    `;
    const data = await getAll(query, [req.params.id]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
