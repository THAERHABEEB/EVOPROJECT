const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getOne, getAll, runQuery, pool } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET all records (with optional filtering by course_id)
router.get('/', async (req, res) => {
  try {
    const { course_id } = req.query;
    let query = 'SELECT * FROM "upload_grades"';
    let params = [];

    if (course_id) {
      query += ' WHERE course_id = $1';
      params.push(course_id);
    }

    const data = await getAll(query, params);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from upload_grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// GET a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await getOne('SELECT * FROM "upload_grades" WHERE id = $1', [req.params.id]);
    if (!data) {
      return res.status(404).json({ status: 'error', error: 'Record not found' });
    }
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data from upload_grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Create a new record
router.post('/', async (req, res) => {
  try {
    const { course_id, doctor_id, control_id, spec_id, file_name, folder, year_level, status, upload_date, approval } = req.body;
    const result = await runQuery('INSERT INTO "upload_grades" (course_id, doctor_id, control_id, spec_id, file_name, folder, year_level, status, upload_date, approval) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [req.body.course_id, req.body.doctor_id, req.body.control_id, req.body.spec_id, req.body.file_name, req.body.folder, req.body.year_level, req.body.status, req.body.upload_date, req.body.approval]);
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into upload_grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// PUT - Update a record by ID
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const recordId = req.params.id;

    // 1. Get existing record to check current status and file info
    const existingRecord = await getOne('SELECT * FROM "upload_grades" WHERE id = $1', [recordId]);
    if (!existingRecord) return res.status(404).json({ status: 'error', error: 'Record not found' });

    // 2. Start Processing if status changed to 'Approved'
    if (status === 'Approved' && existingRecord.status !== 'Approved') {
        const { course_id, file_name, folder } = existingRecord;
        const filePath = path.resolve(__dirname, '../../Front/public', folder, file_name);

        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(400).json({ status: 'error', error: 'Grade file not found on server' });
        }

        const csvContent = fs.readFileSync(filePath, 'utf-8');
        const lines = csvContent.trim().split('\n').filter(line => line.trim() !== '').map(l => l.split(',').map(c => c.trim()));
        
        if (lines.length < 2) {
            return res.status(400).json({ status: 'error', error: 'Grade file is empty or invalid' });
        }

        const headers = lines[0]; // StudentID,Name,Mid_Grades,Final_Grades,Sup_Grades,Letter_Grades
        const rows = lines.slice(1);

        // Fetch latest semester_id for this course
        const semester = await getOne('SELECT id FROM "semesters" ORDER BY start_date DESC LIMIT 1');
        if (!semester) return res.status(500).json({ status: 'error', error: 'No semester found in database' });

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const row of rows) {
                // Map columns based on known header order: StudentID,Name,Mid_Grades,Final_Grades,Sup_Grades,Letter_Grades
                const studentId = row[0];
                const mid = row[2] || 0;
                const final = row[3] || 0;
                const sup = row[4] || 0;
                const letter = row[5] || '';
                
                // Check if grade exists for this student, course, and semester
                const checkRes = await client.query(
                  'SELECT id FROM "grade" WHERE student_id = $1 AND course_id = $2 AND semester_id = $3',
                  [studentId, course_id, semester.id]
                );
                
                if (checkRes.rowCount > 0) {
                    await client.query(
                        'UPDATE "grade" SET mid_grades = $1, final_grades = $2, sup_grades = $3, letter_grades = $4 WHERE id = $5',
                        [mid, final, sup, letter, checkRes.rows[0].id]
                    );
                } else {
                    await client.query(
                        'INSERT INTO "grade" (student_id, course_id, semester_id, mid_grades, final_grades, sup_grades, letter_grades) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [studentId, course_id, semester.id, mid, final, sup, letter]
                    );
                }
            }

            // Update upload_grades status
            const updateResult = await client.query(
              'UPDATE "upload_grades" SET status = $1 WHERE id = $2 RETURNING *',
              ['Approved', recordId]
            );

            await client.query('COMMIT');
            res.json({ status: 'success', data: updateResult.rows[0], message: 'Grades approved and imported successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } else {
        // Normal update if not switching to Approved or already Approved
        const { course_id, doctor_id, control_id, spec_id, file_name, folder, year_level, upload_date, approval } = req.body;
        const result = await runQuery('UPDATE "upload_grades" SET course_id = $1, doctor_id = $2, control_id = $3, spec_id = $4, file_name = $5, folder = $6, year_level = $7, status = $8, upload_date = $9, approval = $10 WHERE id = $11 RETURNING *', [course_id, doctor_id, control_id, spec_id, file_name, folder, year_level, status, upload_date, approval, recordId]);
        if (result.rowCount === 0) return res.status(404).json({ status: 'error', error: 'Record not found' });
        res.json({ status: 'success', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Error updating data in upload_grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// DELETE a record by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM "upload_grades" WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Record not found or already deleted' });
    }
    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from upload_grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// POST - Submit grades (CSV simulation + DB record)
router.post('/submit', async (req, res) => {
  try {
    const { course_id, doctor_id, grades } = req.body;
    
    // 1. Get Course details
    const courseData = await getOne('SELECT specialization_id, year_level FROM "course" WHERE id = $1', [course_id]);
    if (!courseData) return res.status(404).json({ status: 'error', error: 'Course not found' });

    // 2. Get a Control member ID
    const control = await getOne('SELECT id FROM "control" LIMIT 1');
    if (!control) return res.status(404).json({ status: 'error', error: 'Control member not found' });

    // 3. File Creation (CSV string)
    let csvContent = 'StudentID,Name,Mid_Grades,Final_Grades,Sup_Grades,Letter_Grades\n';
    grades.forEach(g => {
      csvContent += `${g.id},${g.name},${g.mid_grades},${g.final_grades},${g.sup_grades},${g.letter_grades}\n`;
    });

    // 4. Save or Update Upload_Grades
    const existingUpload = await getOne('SELECT id, file_name, folder FROM "upload_grades" WHERE course_id = $1 AND doctor_id = $2', [course_id, doctor_id]);

    if (existingUpload) {
      // Overwrite the existing file
      const existingFilePath = path.join(path.resolve(__dirname, '../../Front/public', existingUpload.folder), existingUpload.file_name);
      fs.writeFileSync(existingFilePath, csvContent);

      // Update the record Status to 'Pending'
      await runQuery('UPDATE "upload_grades" SET status = $1, upload_date = NOW() WHERE id = $2', ['Pending', existingUpload.id]);
      
      res.status(200).json({ status: 'success', message: 'Grades file updated and sent to control for review.' });
    } else {
      // Create new file and record
      const fileName = `grades_${course_id}_${Date.now()}.csv`;
      const folder = 'grades';
      const frontPublicPath = path.resolve(__dirname, '../../Front/public', folder);
      const filePath = path.join(frontPublicPath, fileName);

      if (!fs.existsSync(frontPublicPath)) {
        fs.mkdirSync(frontPublicPath, { recursive: true });
      }

      fs.writeFileSync(filePath, csvContent);

      const query = `
        INSERT INTO "upload_grades" (course_id, doctor_id, control_id, spec_id, file_name, folder, year_level, status, upload_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `;
      const params = [
        course_id, 
        doctor_id, 
        control.id, 
        courseData.specialization_id, 
        fileName, 
        folder, 
        courseData.year_level, 
        'Pending'
      ];
      await runQuery(query, params);

      res.status(201).json({ status: 'success', message: 'Grades submitted and CSV generated.' });
    }
  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
