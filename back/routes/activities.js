const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware
router.use(authenticateToken);

// GET all activities
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "activity" ORDER BY date DESC');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET activities for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const query = `
      SELECT a.*, sa.registration_date 
      FROM "activity" a
      JOIN "student_activity" sa ON a.id = sa.activity_id
      WHERE sa.student_id = $1
      ORDER BY a.date DESC
    `;
    const data = await getAll(query, [studentId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student activities:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Join an activity
router.post('/join', async (req, res) => {
  try {
    const { student_id, activity_id } = req.body;
    if (!student_id || !activity_id) {
      return res.status(400).json({ status: 'error', error: 'Missing student_id or activity_id' });
    }

    const result = await runQuery(
      'INSERT INTO "student_activity" (student_id, activity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [student_id, activity_id]
    );

    res.json({ status: 'success', data: result.rows[0] || { message: 'Already joined' } });
  } catch (error) {
    console.error('Error joining activity:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
