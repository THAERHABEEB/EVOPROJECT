const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery } = require('../config/db.js');
const authenticateToken = require('../middleware/auth.js');

router.use(authenticateToken);

// Create a new quiz
router.post('/create', async (req, res) => {
  try {
    const { course_id, doctor_id: userId, title, description, questions, due_date } = req.body;

    // --- Ensure Tables Exist (Self-Healing) ---
    await runQuery(`CREATE TABLE IF NOT EXISTS "quiz" (id SERIAL PRIMARY KEY, course_id INT, doctor_id INT, title VARCHAR(255), description TEXT, task_number INT, total_points INT DEFAULT 0, due_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    try { await runQuery(`ALTER TABLE "quiz" ADD COLUMN IF NOT EXISTS due_date TIMESTAMP`); } catch(e){}
    await runQuery(`CREATE TABLE IF NOT EXISTS "quiz_question" (id SERIAL PRIMARY KEY, quiz_id INT, question_text TEXT, question_type VARCHAR(50), points INT DEFAULT 1)`);
    await runQuery(`CREATE TABLE IF NOT EXISTS "quiz_option" (id SERIAL PRIMARY KEY, question_id INT, option_text TEXT, is_correct BOOLEAN DEFAULT false)`);
    await runQuery(`CREATE TABLE IF NOT EXISTS "quiz_submission" (id SERIAL PRIMARY KEY, quiz_id INT, student_id INT, score DECIMAL(5,2), total_possible INT, submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await runQuery(`CREATE TABLE IF NOT EXISTS "quiz_answer" (id SERIAL PRIMARY KEY, submission_id INT, question_id INT, student_answer TEXT, is_correct BOOLEAN)`);
    // ------------------------------------------

    // Resolve Doctor ID from USER ID
    const doctorRecord = await getOne('SELECT id FROM "doctor" WHERE user_id = $1', [userId]);
    if (!doctorRecord) {
      return res.status(404).json({ status: 'error', error: 'Doctor profile not found' });
    }
    const realDoctorId = doctorRecord.id;

    // 1. Get task number (automatic)
    const taskCount = await getOne('SELECT COUNT(*) FROM "quiz" WHERE course_id = $1', [course_id]);
    const task_number = parseInt(taskCount.count) + 1;

    // 2. Insert Quiz
    const quizResult = await runQuery(
      'INSERT INTO "quiz" (course_id, doctor_id, title, description, task_number, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [course_id, realDoctorId, title, description, task_number, due_date]
    );
    const quizId = quizResult.rows[0].id;

    // 3. Insert Questions and Options
    let totalPoints = 0;
    for (const q of questions) {
      const qResult = await runQuery(
        'INSERT INTO "quiz_question" (quiz_id, question_text, question_type, points) VALUES ($1, $2, $3, $4) RETURNING *',
        [quizId, q.text, q.type, q.points || 1]
      );
      const questionId = qResult.rows[0].id;
      totalPoints += parseFloat(q.points || 1);

      if (q.options && q.options.length > 0) {
        for (const opt of q.options) {
          await runQuery(
            'INSERT INTO "quiz_option" (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
            [questionId, opt.text, opt.is_correct]
          );
        }
      }
    }

    // Update total points
    await runQuery('UPDATE "quiz" SET total_points = $1 WHERE id = $2', [totalPoints, quizId]);

    res.json({ status: 'success', data: { quiz_id: quizId, task_number } });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Get quizzes for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Simplest possible query to avoid errors
    const query = `
      SELECT q.*, 
      (SELECT score FROM "quiz_submission" WHERE quiz_id = q.id AND student_id = $1 LIMIT 1) as student_score
      FROM "quiz" q
      ORDER BY q.created_at DESC
    `;
    const data = await getAll(query, [studentId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Get quiz details (with questions and options)
router.get('/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await getOne('SELECT * FROM "quiz" WHERE id = $1', [quizId]);
    if (!quiz) return res.status(404).json({ status: 'error', error: 'Quiz not found' });

    const questions = await getAll('SELECT * FROM "quiz_question" WHERE quiz_id = $1', [quizId]);
    
    for (let q of questions) {
      q.options = await getAll('SELECT id, option_text FROM "quiz_option" WHERE question_id = $1', [q.id]);
    }

    res.json({ status: 'success', data: { ...quiz, questions } });
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Submit quiz
router.post('/submit', async (req, res) => {
  try {
    const { quiz_id, student_id, answers } = req.body;
    
    // 1. Get correct answers
    const questions = await getAll('SELECT * FROM "quiz_question" WHERE quiz_id = $1', [quiz_id]);
    let score = 0;
    let totalPossible = 0;

    const submissionResult = await runQuery(
      'INSERT INTO "quiz_submission" (quiz_id, student_id, total_possible) VALUES ($1, $2, $3) RETURNING *',
      [quiz_id, student_id, 0] // total_possible will be updated
    );
    const submissionId = submissionResult.rows[0].id;

    for (const q of questions) {
      totalPossible += q.points;
      const studentAnswer = answers[q.id];
      let isCorrect = false;

      if (q.question_type === 'mcq' || q.question_type === 'true_false') {
        const correctOption = await getOne('SELECT id FROM "quiz_option" WHERE question_id = $1 AND is_correct = true', [q.id]);
        if (correctOption && correctOption.id == studentAnswer) {
          isCorrect = true;
          score += q.points;
        }
      } else if (q.question_type === 'fill_blanks') {
        const correctOption = await getOne('SELECT option_text FROM "quiz_option" WHERE question_id = $1', [q.id]);
        if (correctOption && correctOption.option_text.trim().toLowerCase() === String(studentAnswer).trim().toLowerCase()) {
          isCorrect = true;
          score += q.points;
        }
      } else if (q.question_type === 'essay') {
        // Essay needs manual grading, set as null for now
        isCorrect = null;
      }

      await runQuery(
        'INSERT INTO "quiz_answer" (submission_id, question_id, student_answer, is_correct) VALUES ($1, $2, $3, $4)',
        [submissionId, q.id, String(studentAnswer), isCorrect]
      );
    }

    await runQuery(
      'UPDATE "quiz_submission" SET score = $1, total_possible = $2 WHERE id = $3',
      [score, totalPossible, submissionId]
    );

    // --- NEW: Sync with "grade" table ---
    try {
      // 1. Get the course_id for this quiz
      const quizInfo = await getOne('SELECT course_id FROM "quiz" WHERE id = $1', [quiz_id]);
      if (quizInfo && quizInfo.course_id) {
        // 2. Check if a grade record exists for this student and course
        const existingGrade = await getOne(
          'SELECT id, sup_grades FROM "grade" WHERE student_id = $1 AND course_id = $2',
          [student_id, quizInfo.course_id]
        );

        if (existingGrade) {
          // Accumulate scores: Add new score to existing sup_grades
          const newTotalSup = (parseFloat(existingGrade.sup_grades) || 0) + parseFloat(score);
          await runQuery(
            'UPDATE "grade" SET sup_grades = $1 WHERE id = $2',
            [newTotalSup, existingGrade.id]
          );
        } else {
          // Create new grade record
          await runQuery(
            'INSERT INTO "grade" (student_id, course_id, sup_grades) VALUES ($1, $2, $3)',
            [student_id, quizInfo.course_id, score]
          );
        }
      }
    } catch (gradeErr) {
      console.error('Error syncing quiz score to grade table:', gradeErr);
    }

    res.json({ status: 'success', data: { score, totalPossible } });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

// Debug route to check DB status
router.get('/debug/db', async (req, res) => {
  try {
    const tables = await getAll("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const quizCount = await getOne('SELECT COUNT(*) FROM "quiz"');
    res.json({ status: 'success', tables: tables.map(t => t.table_name), quizCount });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// NEW: Sync all existing submissions to grades table (Accumulative)
router.get('/debug/sync-grades', async (req, res) => {
  try {
    // 1. Get summed scores for each student/course pair
    const query = `
      SELECT qs.student_id, q.course_id, SUM(qs.score) as total_score 
      FROM quiz_submission qs 
      JOIN quiz q ON qs.quiz_id = q.id 
      GROUP BY qs.student_id, q.course_id
    `;
    const submissions = await getAll(query);

    for (const s of submissions) {
      const existing = await getOne('SELECT id FROM grade WHERE student_id = $1 AND course_id = $2', [s.student_id, s.course_id]);
      if (existing) {
        await runQuery('UPDATE grade SET sup_grades = $1 WHERE id = $2', [s.total_score, existing.id]);
      } else {
        await runQuery('INSERT INTO grade (student_id, course_id, sup_grades) VALUES ($1, $2, $3)', [s.student_id, s.course_id, s.total_score]);
      }
    }
    res.json({ status: 'success', message: `Synced and accumulated ${submissions.length} student-course records` });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET all submissions for a doctor's quizzes
router.get('/submissions/doctor/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Resolve Doctor ID from USER ID
    const doctorRecord = await getOne('SELECT id FROM "doctor" WHERE user_id = $1', [userId]);
    if (!doctorRecord) {
      return res.status(404).json({ status: 'error', error: 'Doctor not found' });
    }
    const doctorId = doctorRecord.id;

    const query = `
      SELECT 
        qs.id, 
        qs.score, 
        qs.total_possible, 
        qs.submitted_at, 
        s.name as student_name, 
        s.id as student_id,
        q.title as quiz_title,
        q.id as quiz_id
      FROM quiz_submission qs
      JOIN students s ON qs.student_id = s.id
      JOIN quiz q ON qs.quiz_id = q.id
      WHERE q.doctor_id = $1
      ORDER BY qs.submitted_at DESC
    `;
    const data = await getAll(query, [doctorId]);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching doctor submissions:', error);
    res.status(500).json({ status: 'error', error: 'Database error' });
  }
});

module.exports = router;
