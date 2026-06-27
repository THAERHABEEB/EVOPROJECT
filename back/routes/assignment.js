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

// --- COURSE ASSIGNMENTS APIs ---

// Create course assignment
router.post('/course', async (req, res) => {
  try {
    const { course_id, doctor_id, title, details, file_url, image_url, start_date, end_date, total_grade } = req.body;
    const result = await runQuery(`
      INSERT INTO course_assignments 
      (course_id, doctor_id, title, details, file_url, image_url, start_date, end_date, total_grade) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`, 
      [course_id, doctor_id, title, details, file_url, image_url, start_date, end_date, total_grade]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating course assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Get assignments for student (via enrollments)
router.get('/course/student/:studentId', async (req, res) => {
  try {
    const query = `
      SELECT a.*, c.name as course_name, s.grade as student_grade, s.status as submission_status, s.file_url as submission_url
      FROM course_assignments a
      JOIN enrollments e ON a.course_id = e.course_id
      JOIN course c ON a.course_id = c.id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = $1
      WHERE e.student_id = $1
      ORDER BY a.end_date DESC
    `;
    const data = await getAll(query, [req.params.studentId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching course assignments for student:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Submit assignment
router.post('/submit', async (req, res) => {
  try {
    const { assignment_id, student_id, file_url } = req.body;
    
    // check deadline
    const assignment = await getOne('SELECT end_date FROM course_assignments WHERE id = $1', [assignment_id]);
    if (new Date() > new Date(assignment.end_date)) {
      return res.status(400).json({ status: 'error', error: 'Deadline passed' });
    }

    // Upsert submission
    const check = await getOne('SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2', [assignment_id, student_id]);
    if (check) {
      const result = await runQuery('UPDATE assignment_submissions SET file_url = $1, submission_date = NOW(), status = \'submitted\' WHERE id = $2 RETURNING *', [file_url, check.id]);
      return res.json({ status: 'success', data: result.rows[0] });
    }

    const result = await runQuery(`
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url)
      VALUES ($1, $2, $3) RETURNING *`, [assignment_id, student_id, file_url]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Get submissions for doctor
router.get('/doctor/:doctorId/submissions', async (req, res) => {
  try {
    const query = `
      SELECT s.*, a.title, a.course_id, a.total_grade, st.name as student_name
      FROM assignment_submissions s
      JOIN course_assignments a ON s.assignment_id = a.id
      JOIN students st ON s.student_id = st.id
      WHERE a.doctor_id = $1
      ORDER BY s.submission_date DESC
    `;
    const data = await getAll(query, [req.params.doctorId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching submissions for doctor:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Grade submission
router.post('/grade', async (req, res) => {
  try {
    const { submission_id, grade } = req.body;
    const submissionResult = await runQuery('UPDATE assignment_submissions SET grade = $1, status = \'graded\' WHERE id = $2 RETURNING *', [grade, submission_id]);
    if (submissionResult.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Submission not found' });
    
    // Fetch info to update main grade table
    const sub = submissionResult.rows[0];
    const assignment = await getOne('SELECT course_id FROM course_assignments WHERE id = $1', [sub.assignment_id]);
    
    // Assuming mid_grades gets the addition for simplicity, or we just insert if not exists
    await runQuery(`
      INSERT INTO grade (student_id, course_id, mid_grades, final_grades) 
      VALUES ($1, $2, $3, 0) 
      ON CONFLICT (id) DO NOTHING
    `, [sub.student_id, assignment.course_id, grade]); // In reality we need proper logic or ON CONFLICT to update.
    // Since we don't know the exact unique constraints of 'grade', let's do a simple UPDATE or INSERT manually
    const existingGrade = await getOne('SELECT id FROM grade WHERE student_id = $1 AND course_id = $2', [sub.student_id, assignment.course_id]);
    if (existingGrade) {
      await runQuery('UPDATE grade SET mid_grades = COALESCE(mid_grades, 0) + $1 WHERE id = $2', [grade, existingGrade.id]);
    } else {
      await runQuery('INSERT INTO grade (student_id, course_id, mid_grades) VALUES ($1, $2, $3)', [sub.student_id, assignment.course_id, grade]);
    }

    res.json({ status: 'success', message: 'Graded successfully' });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
