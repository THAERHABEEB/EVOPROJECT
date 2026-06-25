const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const user = req.user;
    let query = `
      SELECT 
        sr.*, 
        rt.type_key, rt.title as type_title, 
        s.name as student_name, s.code as student_code, s.department as specialization
      FROM student_request sr
      JOIN request_type rt ON sr.type_request_id = rt.id
      JOIN students s ON sr.student_id = s.id
    `;
    let params = [];

    if (user.role.toLowerCase() === 'student') {
      const student = await getOne('SELECT id FROM students WHERE user_id = $1', [user.id]);
      if (!student) return res.status(404).json({ status: 'error', error: 'Student profile not found' });
      query += ' WHERE sr.student_id = $1 ORDER BY sr.id DESC';
      params.push(student.id);
    } else if (user.role.toLowerCase() === 'student affair') {
      query += ' ORDER BY sr.id DESC';
    } else {
      // Admins or others can see all, or we restrict them.
      query += ' ORDER BY sr.id DESC';
    }

    const data = await getAll(query, params);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student_request:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = req.user;
    if (user.role.toLowerCase() !== 'student') {
      return res.status(403).json({ status: 'error', error: 'Only students can submit requests' });
    }

    const student = await getOne('SELECT id FROM students WHERE user_id = $1', [user.id]);
    if (!student) return res.status(404).json({ status: 'error', error: 'Student profile not found' });

    const { type_request_id, notes, img } = req.body;
    const status = 'pending';
    const create_at = new Date();

    const result = await runQuery(
      'INSERT INTO student_request (student_id, type_request_id, status, create_at, notes, img) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
      [student.id, type_request_id, status, create_at, notes, img]
    );
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting student_request:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = req.user;
    if (user.role.toLowerCase() !== 'student affair') {
      return res.status(403).json({ status: 'error', error: 'Only Student Affair can update status' });
    }
    
    const { status } = req.body;
    const result = await runQuery(
      'UPDATE student_request SET status = $1, viewed_by = $2 WHERE id = $3 RETURNING *',
      [status, user.id, req.params.id]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating student_request:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
