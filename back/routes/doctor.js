const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records (handles optional user_id filtering)
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT * FROM "doctor"';
    let params = [];
    
    if (user_id) {
      query += ' WHERE user_id = $1';
      params.push(user_id);
    }
    
    const data = await getAll(query, params);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from doctor:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "doctor" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from doctor:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { user_id, name, department, qualification, officelocation, email, photo, rating } = req.body;
    const result = await runQuery('INSERT INTO "doctor" (user_id, name, department, qualification, officelocation, email, photo, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [req.body.user_id, req.body.name, req.body.department, req.body.qualification, req.body.officelocation, req.body.email, req.body.photo, req.body.rating]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into doctor:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { user_id, name, department, qualification, officelocation, email, photo, rating } = req.body;
    const result = await runQuery('UPDATE "doctor" SET user_id = $1, name = $2, department = $3, qualification = $4, officelocation = $5, email = $6, photo = $7, rating = $8 WHERE id = $9 RETURNING *', [req.body.user_id, req.body.name, req.body.department, req.body.qualification, req.body.officelocation, req.body.email, req.body.photo, req.body.rating, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in doctor:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "doctor" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from doctor:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET all courses assigned to a doctor
router.get('/:id/courses', async (req, res) => {
  try {
    const query = `
      SELECT * 
      FROM Course 
      WHERE Doctor_id = $1
    `;
    const data = await getAll(query, [req.params.id]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching doctor courses:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
