const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');
const bcrypt = require('bcryptjs');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "USER"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from USER:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "USER" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from USER:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record
router.post('/', async (req, res) => {
  try {
    const { name, password, role, remember_token, last_login, created_at, updated_at } = req.body;
    
    // Hash the password if provided
    let hashedPassword = password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const result = await runQuery(
      'INSERT INTO "USER" (name, password, role, remember_token, last_login, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
      [name, hashedPassword, role, remember_token, last_login, created_at, updated_at]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into USER:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'password' && value) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(value, salt);
        updates.push(`password = $${paramIndex++}`);
        params.push(hashedPassword);
      } else if (key !== 'id') { // Don't allow updating ID
        updates.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: 'error', error: 'No fields to update' });
    }

    const query = `UPDATE "USER" SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    params.push(req.params.id);

    const result = await runQuery(query, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in USER:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});



// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "USER" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from USER:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});



module.exports = router;
