const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// ESP32 RFID Endpoint (No Auth so hardware can post easily)
router.post('/rfid', async (req, res) => {
  try {
    const { uid, type } = req.body;
    if (!uid) return res.status(400).json({ status: 'error', error: 'Missing uid' });

    // 1. Find Student
    const student = await getOne('SELECT * FROM students WHERE code = $1', [uid]);
    if (!student) return res.status(404).json({ status: 'error', error: 'Unknown Card' });

    // 2. Get current Egypt Time (approximate by using server time assuming UTC and adding 2 or 3 hrs, 
    // or better just use the day/hour/min from the request if the ESP32 sent it, but the ESP32 currently doesn't send time, it relies on its own time.
    // Since the backend is in UTC, we can convert it to Africa/Cairo.
    const now = new Date();
    const options = { timeZone: 'Africa/Cairo', hour12: false };
    const dayOfWeek = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', weekday: 'i' }).format(now)); 
    // JS getDay(): Sun=0, Mon=1, Sat=6. Intl weekday: 'i' is not standard. Let's just use toLocaleString:
    // A safer way:
    const cairoString = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
    const cairoDate = new Date(cairoString);
    const day = cairoDate.getDay(); // 0-6
    const timeStr = `${cairoDate.getHours().toString().padStart(2, '0')}:${cairoDate.getMinutes().toString().padStart(2, '0')}:00`;

    // Parse section from Department (e.g. 'Section 2')
    let section = 0;
    if (student.department && student.department.includes('Section')) {
       section = parseInt(student.department.replace('Section', '').trim());
    }

    // 3. Find active lecture for this section
    // A lecture is active if current time is between start_time and end_time (with some margin)
    const lectures = await getAll(`
      SELECT * FROM lecture 
      WHERE day_of_week = $1 
      AND (section_num = $2 OR section_num = 0)
    `, [day, section]);

    let activeLec = null;
    for (const lec of lectures) {
      if (lec.start_time <= timeStr && lec.end_time >= timeStr) {
        activeLec = lec;
        break;
      }
    }

    if (!activeLec) {
      return res.json({ status: 'success', message: 'No active class', student: student.name });
    }

    const course = await getOne('SELECT name FROM course WHERE id = $1', [activeLec.course_id]);
    const doctor = await getOne('SELECT name FROM doctor WHERE id = $1', [activeLec.doctor_id]);

    if (type === 'entry') {
      // check if already marked present today for this lecture
      const existing = await getOne('SELECT * FROM attendance WHERE student_id = $1 AND lecture_id = $2 AND DATE(join_time) = CURRENT_DATE', [student.id, activeLec.id]);
      if (!existing) {
         await runQuery('INSERT INTO attendance (student_id, lecture_id, join_time, status) VALUES ($1, $2, NOW(), $3)', [student.id, activeLec.id, 'Present']);
      }
    } else if (type === 'exit') {
      const existing = await getOne('SELECT * FROM attendance WHERE student_id = $1 AND lecture_id = $2 AND DATE(join_time) = CURRENT_DATE', [student.id, activeLec.id]);
      if (existing && !existing.leave_time) {
         await runQuery('UPDATE attendance SET leave_time = NOW() WHERE id = $1', [existing.id]);
      }
    }

    res.json({ status: 'success', student: student.name, subject: course ? course.name : 'Unknown', doctor: doctor ? doctor.name : 'Unknown' });
  } catch (error) {
    console.error('RFID Error:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records
router.get('/', async (req, res) => {
  try {
    const data = await getAll('SELECT * FROM "attendance"');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from attendance:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "attendance" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from attendance:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record (Simplified boilerplate, replace columns as needed)
router.post('/', async (req, res) => {
  try {
    const { student_id, lecture_id, join_time, leave_time, duration, status } = req.body;
    const result = await runQuery('INSERT INTO "attendance" (student_id, lecture_id, join_time, leave_time, duration, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.body.student_id, req.body.lecture_id, req.body.join_time, req.body.leave_time, req.body.duration, req.body.status]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into attendance:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { student_id, lecture_id, join_time, leave_time, duration, status } = req.body;
    const result = await runQuery('UPDATE "attendance" SET student_id = $1, lecture_id = $2, join_time = $3, leave_time = $4, duration = $5, status = $6 WHERE id = $7 RETURNING *', [req.body.student_id, req.body.lecture_id, req.body.join_time, req.body.leave_time, req.body.duration, req.body.status, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating data in attendance:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "attendance" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from attendance:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
