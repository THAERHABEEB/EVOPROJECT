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
    const userId = req.params.id;
    // Resolve Doctor ID from USER ID
    const doctorRecord = await getOne('SELECT id FROM "doctor" WHERE user_id = $1', [userId]);
    if (!doctorRecord) {
      return res.status(404).json({ status: 'error', error: 'Doctor not found' });
    }
    const doctorId = doctorRecord.id;

    const query = `
      SELECT * FROM "course" WHERE doctor_id = $1
    `;
    const data = await getAll(query, [doctorId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching doctor courses:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Upload Video for a specific course
router.post('/:id/upload-video', async (req, res) => {
  try {
    const userId = req.params.id;
    const { course_id, title, folder_url, file_size } = req.body;

    if (!course_id || !title || !folder_url) {
      return res.status(400).json({ status: 'error', error: 'Missing required fields: course_id, title, or folder_url' });
    }

    // Resolve Doctor ID from USER ID
    const doctorRecord = await getOne('SELECT id FROM "doctor" WHERE user_id = $1', [userId]);
    if (!doctorRecord) {
      return res.status(404).json({ status: 'error', error: 'Doctor profile not found for this user ID: ' + userId });
    }
    const realDoctorId = doctorRecord.id;

    console.log(`Uploading video for Doctor ${realDoctorId}, Course ${course_id}: ${title}`);

    // 1. Create a Lecture record for this video
    const lectureResult = await runQuery(
      'INSERT INTO "lecture" (doctor_id, course_id, name, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [realDoctorId, course_id, title, 'Recorded']
    );
    
    if (!lectureResult.rows || lectureResult.rows.length === 0) {
      throw new Error('Failed to create lecture record');
    }
    
    const lectureId = lectureResult.rows[0].id;

    // 2. Create a Lecture_materials record
    const materialResult = await runQuery(
      'INSERT INTO "lecture_materials" (lecture_id, name, folder, file_type, file_size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [lectureId, title, folder_url, 'video/mp4', file_size, userId]
    );

    res.json({ status: 'success', data: materialResult.rows[0] });
  } catch (error) {
    console.error('Error uploading video details:', error);
    res.status(500).json({ status: 'error', error: 'Database error: ' + error.message });
  }
});

// GET dashboard statistics for a doctor
router.get('/:id/dashboard-stats', async (req, res) => {
  try {
    const userId = req.params.id;

    // Resolve Doctor ID from USER ID
    const doctorRecord = await getOne('SELECT id FROM "doctor" WHERE user_id = $1', [userId]);
    if (!doctorRecord) {
      return res.status(404).json({ status: 'error', error: 'Doctor not found' });
    }
    const doctorId = doctorRecord.id;

    // 1. Total Students enrolled in this doctor's courses
    const studentsResult = await getOne(`
      SELECT COUNT(DISTINCT e.student_id) as count
      FROM enrollments e
      JOIN course c ON e.course_id = c.id
      WHERE c.doctor_id = $1
    `, [doctorId]);

    // 2. Total Lectures created by this doctor
    const lecturesResult = await getOne(`
      SELECT COUNT(*) as count FROM lecture WHERE doctor_id = $1
    `, [doctorId]);

    // 3. Today's Timeline
    const timeline = await getAll(`
      SELECT c.name as course_name, '10:00 AM' as start_time, '12:00 PM' as end_time
      FROM course c
      WHERE c.doctor_id = $1
      LIMIT 3
    `, [doctorId]);

    res.json({
      status: 'success',
      data: {
        totalStudents: studentsResult.count || 0,
        totalLectures: lecturesResult.count || 0,
        timeline: timeline.map(t => ({
          time: t.start_time,
          endTime: t.end_time,
          title: t.course_name,
          location: `Online / Hall 1`,
          type: 'Lecture'
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
